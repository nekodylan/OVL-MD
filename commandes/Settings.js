const axios = require("axios");
const { ovlcmd } = require("../framework/ovlcmd");

const RENDER_API_KEY = "rnd_Q18yV3cJokoiFcimQThJh8ELEICs";
const SERVICE_ID = "srv-ctqdsvjqf0us73em5fkg";

const headers = {
  Authorization: `Bearer ${RENDER_API_KEY}`,
  "Content-Type": "application/json",
};

async function manageEnvVar(action, key, value = null) {
  try {
    const response = await axios.get(
      `https://api.render.com/v1/services/${SERVICE_ID}/env-vars`,
      { headers }
    );
    const envVars = response.data;

    if (action === "setvar") {
      const existingVar = envVars.find((v) => v.envVar.key === key);

      if (existingVar) {
        existingVar.envVar.value = value;
      } else {
        envVars.push({ envVar: { key, value } });
      }

      await axios.put(
        `https://api.render.com/v1/services/${SERVICE_ID}/env-vars`,
        { envVars },
        { headers }
      );
      return `✨ *Variable définie avec succès !*\n📌 *Clé :* \`${key}\`\n📥 *Valeur :* \`${value}\``;
    } else if (action === "delvar") {
      const updatedEnvVars = envVars.filter((v) => v.envVar.key !== key);

      await axios.put(
        `https://api.render.com/v1/services/${SERVICE_ID}/env-vars`,
        { envVars: updatedEnvVars },
        { headers }
      );
      return `✅ *Variable supprimée avec succès !*\n📌 *Clé :* \`${key}\``;
    } else if (action === "getvar") {
      if (key === "all") {
        if (envVars.length === 0) return "📭 *Aucune variable disponible.*";

        const allVars = envVars
          .map((v) => `📌 *${v.envVar.key}* : \`${v.envVar.value}\``)
          .join("\n");
        return `✨ *Liste des variables d'environnement :*\n\n${allVars}`;
      }

      const envVar = envVars.find((v) => v.envVar.key === key);
      return envVar
        ? `📌 *${key}* : \`${envVar.envVar.value}\``
        : `*Variable introuvable :* \`${key}\``;
    } else {
      return "*Action invalide spécifiée.*";
    }
  } catch (error) {
    console.error(error);
    return `*Erreur :* ${error.response?.data?.message || error.message}`;
  }
}

ovlcmd(
  {
    nom_cmd: "setvar",
    classe: "Render_config_vars",
    desc: "Définit ou met à jour une variable d'environnement sur Render.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms } = cmd_options;

    if (!arg[0] || !arg.includes("=")) {
      return ovl.sendMessage(ms_org, {
        text: "*Utilisation :* `setvar clé = valeur`",
        quoted: ms,
      });
    }

    const [key, ...valueParts] = arg.join(" ").split("=");
    const value = valueParts.join("=").trim();
    const result = await manageEnvVar("setvar", key.trim(), value);

    return ovl.sendMessage(ms_org, {
      text: result,
      quoted: ms,
    });
  }
);

ovlcmd(
  {
    nom_cmd: "getvar",
    classe: "Render_config_vars",
    desc: "Récupère la valeur d'une variable d'environnement sur Render.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms } = cmd_options;

    if (!arg[0]) {
      return ovl.sendMessage(ms_org, {
        text: "*Utilisation :* `getvar clé` pour une variable ou `getvar all` pour toutes les variables.",
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
    classe: "Render_config_vars",
    desc: "Supprime une variable d'environnement sur Render.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms } = cmd_options;

    if (!arg[0]) {
      return ovl.sendMessage(ms_org, {
        text: "*Utilisation :* `delvar clé`",
        quoted: ms,
      });
    }

    const key = arg[0];
    const result = await manageEnvVar("delvar", key);

    return ovl.sendMessage(ms_org, {
      text: result,
      quoted: ms,
    });
  }
);
