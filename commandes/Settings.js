const axios = require("axios");
const { ovlcmd } = require("../framework/ovlcmd");
const { exec } = require("child_process");
const config = require('../set');

const RENDER_API_KEY = config.RENDER_API_KEY;
const SERVICE_ID = config.SERVICE_ID;

const headers = {
  Authorization: `Bearer ${RENDER_API_KEY}`,
  "Content-Type": "application/json",
};

function checkConfig() {
  if (!RENDER_API_KEY || !SERVICE_ID) {
    return "*Erreur :* Les variables `RENDER_API_KEY` et `SERVICE_ID` doivent être définies dans la configuration.";
  }
  return null;
}

async function manageEnvVar(action, key, value = null) {
  const configError = checkConfig();
  if (configError) return configError;

  try {
    const response = await axios.get(
      `https://api.render.com/v1/services/${SERVICE_ID}/env-vars`,
      { headers }
    );
    let envVars = response.data.map((v) => ({ key: v.envVar.key, value: v.envVar.value }));

    if (action === "setvar") {
      const existingVar = envVars.find((v) => v.key === key);

      if (existingVar) {
        existingVar.value = value;
      } else {
        envVars.push({ key, value });
      }

      await axios.put(
        `https://api.render.com/v1/services/${SERVICE_ID}/env-vars`,
        envVars,
        { headers }
      );
      return `✨ *Variable définie avec succès !*\n📌 *Clé :* \`${key}\`\n📥 *Valeur :* \`${value}\``;

    } else if (action === "delvar") {
      envVars = envVars.filter((v) => v.key !== key);

      await axios.put(
        `https://api.render.com/v1/services/${SERVICE_ID}/env-vars`,
        envVars,
        { headers }
      );
      return `✅ *Variable supprimée avec succès !*\n📌 *Clé :* \`${key}\``;

    } else if (action === "getvar") {
      if (key === "all") {
        if (envVars.length === 0) return "📭 *Aucune variable disponible.*";

        const allVars = envVars
          .map((v) => `📌 *${v.key}* : \`${v.value}\``)
          .join("\n");
        return `✨ *Liste des variables d'environnement :*\n\n${allVars}`;
      }

      const envVar = envVars.find((v) => v.key === key);
      return envVar
        ? `📌 *${key}* : \`${envVar.value}\``
        : `*Variable introuvable :* \`${key}\``;
    }
  } catch (error) {
    console.error(error);
    return `*Erreur :* ${error.response?.data?.message || error.message}`;
  }
}

async function getRenderCommit() {
  try {
    const response = await axios.get(
      `https://api.render.com/v1/services/${SERVICE_ID}/deploys`,
      { headers }
    );
    const lastDeploy = response.data[0];
    return lastDeploy ? lastDeploy.commitSha : null;
  } catch (error) {
    console.error(error);
    throw new Error("Impossible de récupérer le dernier commit déployé sur Render.");
  }
}

async function getGitCommit() {
  try {
    const { stdout, stderr } = await execPromise("git log -1 --format=%H");
    
    if (stderr) {
      throw new Error(`Git error: ${stderr}`);
    }
    
    if (!stdout) {
      throw new Error("No commit hash returned.");
    }

    return stdout.trim();
  } catch (error) {
    console.error(error);
    throw new Error("Impossible de récupérer le dernier commit depuis Git.");
  }
}

function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function deployRender() {
  try {
    await axios.post(
      `https://api.render.com/v1/services/${SERVICE_ID}/deploys`,
      {},
      { headers }
    );
    return "✅ Déploiement lancé avec succès....";
  } catch (error) {
    console.error(error);
    throw new Error("Échec du lancement du déploiement sur Render.");
  }
}

ovlcmd(
  {
    nom_cmd: "setvar",
    classe: "Render_config",
    desc: "Définit ou met à jour une variable d'environnement sur Render.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms, prenium_id } = cmd_options;

    if (!prenium_id) {
      return ovl.sendMessage(ms_org, {
        text: "Cette commande est réservée aux utilisateurs premium",
        quoted: ms,
      });
    }

    const configError = checkConfig();
    if (configError) {
      return ovl.sendMessage(ms_org, {
        text: configError,
        quoted: ms,
      });
    }

    if (!arg[0] || !arg.includes("=")) {
      return ovl.sendMessage(ms_org, {
        text: "*Utilisation :* `setvar clé = valeur`",
        quoted: ms,
      });
    }

    const [key, ...valueParts] = arg.join(" ").split("=");
    const value = valueParts.join("=").trim();
    const result = await manageEnvVar("setvar", key.trim(), value);

     ovl.sendMessage(ms_org, {
      text: result,
      quoted: ms,
    });
    exec("pm2 restart all");
    return;
  }
);

ovlcmd(
  {
    nom_cmd: "getvar",
    classe: "Render_config",
    desc: "Récupère la valeur d'une variable d'environnement sur Render.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms, prenium_id } = cmd_options;

    if (!prenium_id) {
      return ovl.sendMessage(ms_org, {
        text: "Cette commande est réservée aux utilisateurs premium",
        quoted: ms,
      });
    }

    const configError = checkConfig();
    if (configError) {
      return ovl.sendMessage(ms_org, {
        text: configError,
        quoted: ms,
      });
    }

    if (!arg[0]) {
      return ovl.sendMessage(ms_org, {
        text: "*Utilisation :* `delvar clé`",
        quoted: ms,
      });
    }

    const key = arg[0];
    const result = await manageEnvVar("getvar", key);

    return ovl.sendMessage(ms_org, {
      text: result,
      quoted: ms,
    });
  }
);

ovlcmd(
  {
    nom_cmd: "delvar",
    classe: "Render_config",
    desc: "Supprime une variable d'environnement sur Render.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms, prenium_id } = cmd_options;

    if (!prenium_id) {
      return ovl.sendMessage(ms_org, {
        text: "Cette commande est réservée aux utilisateurs premium",
        quoted: ms,
      });
    }

    const configError = checkConfig();
    if (configError) {
      return ovl.sendMessage(ms_org, {
        text: configError,
        quoted: ms,
      });
    }

    if (!arg[0]) {
      return ovl.sendMessage(ms_org, {
        text: "*Utilisation :* `delvar clé`",
        quoted: ms,
      });
    }

    const key = arg[0];
    const result = await manageEnvVar("delvar", key);

     ovl.sendMessage(ms_org, {
      text: result,
      quoted: ms,
    });
    exec("pm2 restart all");
    return;
  }
);

ovlcmd(
  {
    nom_cmd: "maj",
    classe: "Render_config",
    desc: "Vérifie et déploie la dernière version de l'application sur Render.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms, prenium_id } = cmd_options;

    if (!prenium_id) {
      return ovl.sendMessage(ms_org, {
        text: "Cette commande est réservée aux utilisateurs premium",
        quoted: ms,
      });
    }

    if (!RENDER_API_KEY || !SERVICE_ID) {
      return ovl.sendMessage(ms_org, {
        text: "Erreur : Les informations de configuration pour Render (API Key et Service ID) ne sont pas définies. Merci de les ajouter.",
        quoted: ms,
      });
    }

    try {
      const renderCommit = await getRenderCommit();
      const gitCommit = await getGitCommit();

      if (renderCommit === gitCommit) {
        return ovl.sendMessage(ms_org, {
          text: "Le bot est déjà à jour",
          quoted: ms,
        });
      } else {
        const deployResult = await deployRender();
        return ovl.sendMessage(ms_org, {
          text: deployResult,
          quoted: ms,
        });
      }
    } catch (error) {
      console.error(error);
      return ovl.sendMessage(ms_org, {
        text: `*Erreur* : ${error.message}`,
        quoted: ms,
      });
    }
  }
);

