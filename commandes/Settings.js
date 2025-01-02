const axios = require("axios");
const { ovlcmd } = require("../framework/ovlcmd");
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

async function restartRenderService() {
  const configError = checkConfig();
  if (configError) return configError;

  try {
    await axios.post(
        `https://api.render.com/v1/services/${SERVICE_ID}/deploys`,
        {},
        { headers }
      );
    return "✅ Le service a été redémarré avec succès !";
  } catch (error) {
    console.error(error);
    return `*Erreur :* ${error.response?.data?.message || error.message}`;
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
    await ovl.sendMessage(ms_org, {
      text: result,
      quoted: ms,
    });
    const restartResult = await restartRenderService();
    await ovl.sendMessage(ms_org, {
      text: restartResult,
      quoted: ms,
    });
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
    await ovl.sendMessage(ms_org, {
      text: result,
      quoted: ms,
    });
    const restartResult = await restartRenderService();
    await ovl.sendMessage(ms_org, {
      text: restartResult,
      quoted: ms,
    });
    return;
  }
);
