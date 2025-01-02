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

function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing command: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`stderr: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
}

async function getRenderCommit() {
  try {
    const response = await axios.get(
      `https://api.render.com/v1/services/${SERVICE_ID}/deploys`,
      { headers }
    );
    
    if (!response.data || response.data.length === 0) {
      throw new Error("Aucun déploiement trouvé sur Render.");
    }
    
    const lastDeploy = response.data[0];
    return lastDeploy ? lastDeploy.commitSha : null;
  } catch (error) {
    console.error(error);
    throw new Error("Impossible de récupérer le dernier commit déployé sur Render.");
  }
}

async function getGitCommit() {
  try {
    const stdout = await execPromise("git log -1 --format=%H");
    
    if (!stdout) {
      throw new Error("No commit hash returned from Git.");
    }

    return stdout.trim();
  } catch (error) {
    console.error(error);
    throw new Error("Impossible de récupérer le dernier commit depuis Git.");
  }
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
