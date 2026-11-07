
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { execFile } = require("child_process");
const { promisify } = require("util");

const app = express();
const runCommand = promisify(execFile);

const PORT = process.env.PORT || 5000;

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors({
  origin: [
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-nagios-secret"]
}));

app.use(express.json());

// ========================================
// APPROVED DOCKER CONTAINERS
// ========================================

const ALLOWED_CONTAINERS = [
  "infrapilot-nginx"
];

// ========================================
// DOCKER COMMAND EXECUTOR
// ========================================

async function dockerCommand(args) {
  try {
    const { stdout } = await runCommand(
      "docker",
      args,
      {
        timeout: 30000,
        windowsHide: true,
        maxBuffer: 1024 * 1024
      }
    );

    return stdout.trim();

  } catch (error) {
    throw new Error(
      error.stderr?.trim() ||
      error.message ||
      "Docker command failed"
    );
  }
}

// ========================================
// VALIDATE CONTAINER
// ========================================

function isAllowed(name) {
  return ALLOWED_CONTAINERS.includes(name);
}

// ========================================
// NAGIOS RECOVERY AUTHENTICATION
// ========================================

function verifyNagiosSecret(req, res, next) {
  const expectedSecret = process.env.NAGIOS_RECOVERY_SECRET;
  const receivedSecret = req.headers["x-nagios-secret"];

  if (!expectedSecret) {
    return res.status(500).json({
      success: false,
      message: "Recovery secret is not configured"
    });
  }

  if (!receivedSecret || receivedSecret !== expectedSecret) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized recovery request"
    });
  }

  next();
}

// ========================================
// BACKEND HEALTH CHECK
// ========================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "InfraPilot backend is running",
    port: PORT
  });
});

// ========================================
// DOCKER CONNECTION CHECK
// ========================================

app.get("/api/docker-health", async (req, res) => {
  try {
    const version = await dockerCommand([
      "info",
      "--format",
      "{{.ServerVersion}}"
    ]);

    res.json({
      success: true,
      connected: true,
      version,
      message: "Docker Desktop connected successfully"
    });

  } catch (error) {
    res.status(503).json({
      success: false,
      connected: false,
      message: "Docker Desktop is disconnected",
      error: error.message
    });
  }
});

// ========================================
// GET ALL MANAGED SERVICES
// ========================================

app.get("/api/services", async (req, res) => {
  try {
    await dockerCommand([
      "info",
      "--format",
      "{{.ServerVersion}}"
    ]);

    const services = [];

    for (const name of ALLOWED_CONTAINERS) {
      try {
        const output = await dockerCommand([
          "inspect",
          "--format",
          "{{.State.Status}}|{{.State.Running}}",
          name
        ]);

        const [status, running] = output.split("|");

        services.push({
          name,
          container: name,
          status,
          healthy: running === "true",
          running: running === "true"
        });

      } catch (error) {
        services.push({
          name,
          container: name,
          status: "not-found",
          healthy: false,
          running: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      total: services.length,
      healthy: services.filter(s => s.healthy).length,
      failed: services.filter(s => !s.healthy).length,
      services
    });

  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Unable to connect to Docker",
      error: error.message
    });
  }
});

// ========================================
// SIMULATE FAILURE
// ========================================

app.post("/api/services/:name/stop", async (req, res) => {
  const { name } = req.params;

  if (!isAllowed(name)) {
    return res.status(403).json({
      success: false,
      message: "Container is not approved"
    });
  }

  try {
    await dockerCommand(["inspect", name]);
    await dockerCommand(["stop", name]);

    const status = await dockerCommand([
      "inspect",
      "--format",
      "{{.State.Status}}",
      name
    ]);

    res.json({
      success: true,
      message: "Failure simulated successfully",
      container: name,
      status,
      healthy: false
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failure simulation failed",
      error: error.message
    });
  }
});

// ========================================
// NAGIOS AUTOMATIC RECOVERY API
// ========================================

app.post(
  "/api/services/:name/recover",
  verifyNagiosSecret,
  async (req, res) => {
    const { name } = req.params;

    if (!isAllowed(name)) {
      return res.status(403).json({
        success: false,
        message: "Container is not approved"
      });
    }

    try {
      await dockerCommand(["inspect", name]);

      const output = await dockerCommand([
        "restart",
        name
      ]);

      const status = await dockerCommand([
        "inspect",
        "--format",
        "{{.State.Status}}",
        name
      ]);

      const healthy = status.toLowerCase() === "running";

      if (!healthy) {
        return res.status(500).json({
          success: false,
          message: "Container recovery unsuccessful",
          container: name,
          status
        });
      }

      res.json({
        success: true,
        message: "Container recovered successfully",
        container: name,
        status: "running",
        healthy: true,
        output
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Container recovery failed",
        error: error.message
      });
    }
  }
);

// ========================================
// REAL DOCKER RESOURCE METRICS
// ========================================

app.get("/api/metrics", async (req, res) => {
  try {
    await dockerCommand([
      "info",
      "--format",
      "{{.ServerVersion}}"
    ]);

    const metrics = [];

    for (const name of ALLOWED_CONTAINERS) {
      try {
        const output = await dockerCommand([
          "stats",
          "--no-stream",
          "--format",
          "{{json .}}",
          name
        ]);

        const data = JSON.parse(output);

        const inspectOutput = await dockerCommand([
          "inspect",
          "--format",
          "{{.State.Status}}",
          name
        ]);

        metrics.push({
          container: name,
          status: inspectOutput,
          available: true,
          cpu: parseFloat(data.CPUPerc) || 0,
          memory: parseFloat(data.MemPerc) || 0,
          memoryUsage: data.MemUsage || "N/A",
          networkIO: data.NetIO || "N/A",
          blockIO: data.BlockIO || "N/A",
          pids: Number(data.PIDs) || 0
        });

      } catch (error) {
        metrics.push({
          container: name,
          status: "unavailable",
          available: false,
          message: error.message
        });
      }
    }

    res.json({
      success: true,
      source: "Docker Engine",
      timestamp: new Date().toISOString(),
      metrics
    });

  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Unable to retrieve Docker metrics",
      error: error.message
    });
  }
});

// ========================================
// MANUAL RECOVERY API
// ========================================

app.post("/api/services/:name/manual-recover", async (req, res) => {
  const name = req.params.name;

  if (!isAllowed(name)) {
    return res.status(403).json({
      success: false,
      message: "Container is not allowed"
    });
  }

  try {
    await dockerCommand(["inspect", name]);

    const output = await dockerCommand([
      "restart",
      name
    ]);

    const status = await dockerCommand([
      "inspect",
      "--format",
      "{{.State.Status}}",
      name
    ]);

    if (status.trim().toLowerCase() !== "running") {
      return res.status(500).json({
        success: false,
        message: "Container restart verification failed",
        container: name,
        status: status.trim()
      });
    }

    return res.json({
      success: true,
      message: "Manual recovery completed successfully",
      container: name,
      status: "running",
      output
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Manual recovery failed",
      error: error.message
    });
  }
});

// ========================================
// ANSIBLE PLAYBOOK EXECUTION HELPER
// ========================================


function runAnsiblePlaybook(playbook, res) {
  const allowedPlaybooks = {
    "deploy-nginx": {
      file: "deploy-nginx.yml",
      message: "Ansible Nginx deployment completed"
    },
    "health-check": {
      file: "health-check.yml",
      message: "Docker health check completed"
    },
    "restart-services": {
      file: "restart-services.yml",
      message: "Docker services restarted successfully"
    }
  };

  const selected = allowedPlaybooks[playbook];

  if (!selected) {
    return res.status(400).json({
      success: false,
      message: "Invalid Ansible playbook"
    });
  }

  // Restart Nginx asynchronously so the API response
  // is sent before the frontend container is restarted.
  if (playbook === "restart-services") {
    res.status(202).json({
      success: true,
      message: "Restart process accepted. Ansible is executing in the background.",
      playbook: selected.file
    });

    execFile(
      "ansible-playbook",
      [
        "-i",
        "/app/ansible/inventory/inventory.ini",
        `/app/ansible/playbooks/${selected.file}`
      ],
      {
        timeout: 120000,
        maxBuffer: 1024 * 1024
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error("Ansible restart failed:", error.message);
          console.error(stderr || "");
          return;
        }

        console.log("Ansible restart completed:");
        console.log(stdout);
      }
    );

    return;
  }

  execFile(
    "ansible-playbook",
    [
      "-i",
      "/app/ansible/inventory/inventory.ini",
      `/app/ansible/playbooks/${selected.file}`
    ],
    {
      timeout: 120000,
      maxBuffer: 1024 * 1024
    },
    (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: `Ansible ${playbook} execution failed`,
          error: error.message,
          output: stdout || "",
          details: stderr || ""
        });
      }

      return res.json({
        success: true,
        message: selected.message,
        playbook: selected.file,
        output: stdout,
        details: stderr
      });
    }
  );
}

// ========================================
// ANSIBLE NGINX DEPLOYMENT API
// ========================================

app.post("/api/automation/deploy-nginx", (req, res) => {
  runAnsiblePlaybook("deploy-nginx", res);
});

// ========================================
// ANSIBLE DOCKER HEALTH CHECK API
// ========================================

app.get("/api/automation/health-check", (req, res) => {
  runAnsiblePlaybook("health-check", res);
});

// ========================================
// ANSIBLE RESTART SERVICES API
// ========================================




app.post("/api/automation/restart-services", (req, res) => {
  runAnsiblePlaybook("restart-services", res);
});

// ========================================
// INVALID API ROUTE HANDLER
// ========================================

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl
  });
});

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

app.use((error, req, res, next) => {
  console.error("Backend Error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: error.message
  });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, "0.0.0.0", () => {
  console.log("-----------------------------------");
  console.log("       INFRAPILOT BACKEND");
  console.log("-----------------------------------");
  console.log(`Backend: http://localhost:${PORT}`);
  console.log("Docker integration: Enabled");
  console.log("Self-Healing: Enabled");
  console.log("Ansible Automation: Enabled");
  console.log("-----------------------------------");
});
