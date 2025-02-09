const { ovlcmd, cmd } = require("../framework/ovlcmd");
const config = require("../set");
const { translate } = require('@vitalets/google-translate-api');
const prefixe = config.PREFIXE;
const axios = require('axios');
const fs = require('fs');
const path = require('path');

ovlcmd(
    {
        nom_cmd: "test",
        classe: "Outils",
        react: "🌟",
        desc: "Tester la connectivité du bot"
    },
    async (ms_org, ovl, cmd_options) => {
        try {
            const mess = `🌐 Bienvenue sur *OVL-MD*, votre bot WhatsApp multi-device.🔍 Tapez *${prefixe}menu* pour voir toutes les commandes disponibles.\n> ©2024 OVL-MD By *AINZ*`;
            const img = 'https://telegra.ph/file/8173c870f9de5570db8c3.jpg';
            await ovl.sendMessage(ms_org, { 
                image: { url: img }, 
                caption: mess 
            });
        } catch (error) {
            console.error("Erreur lors de l'envoi du message de test :", error.message || error);
        }
    }
);


ovlcmd(
    {
        nom_cmd: "description",
        classe: "Outils",
        desc: "Affiche la liste des commandes avec leurs descriptions ou les détails d'une commande spécifique.",
        alias: ["desc", "help"],
    },
    async (ms_org, ovl, cmd_options) => {
        try {
            const { arg } = cmd_options;
            const commandes = cmd;

            if (arg.length) {
                const recherche = arg[0].toLowerCase();
                const commandeTrouvee = commandes.find(
                    (c) =>
                        c.nom_cmd.toLowerCase() === recherche ||
                        c.alias.some((alias) => alias.toLowerCase() === recherche)
                );

                if (commandeTrouvee) {
                    const message = `📜 *Détails de la commande :*\n\n` +
                        `Nom : *${commandeTrouvee.nom_cmd}*\n` +
                        `Alias : [${commandeTrouvee.alias.join(", ")}]\n` +
                        `Description : ${commandeTrouvee.desc}`;
                    return await ovl.sendMessage(ms_org, { text: message });
                } else {
                    return await ovl.sendMessage(ms_org, {
                        text: `❌ Commande ou alias "${recherche}" introuvable. Vérifiez et réessayez.`,
                    });
                }
            }

            let descriptionMsg = "📜 *Liste des commandes disponibles :*\n\n";
            commandes.forEach((cmd) => {
                descriptionMsg += `Nom : *${cmd.nom_cmd}*\nAlias : [${cmd.alias.join(", ")}]\nDescription : ${cmd.desc}\n\n`;
            });

            await ovl.sendMessage(ms_org, { text: descriptionMsg });
        } catch (error) {
            console.error("Erreur lors de l'affichage des descriptions :", error.message || error);
            await ovl.sendMessage(ms_org, { text: "Une erreur s'est produite lors de l'affichage des descriptions." });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "menu",
        classe: "Outils",
        react: "🔅",
        desc: "affiche le menu du bot",
    },
    async (ms_org, ovl, cmd_options) => {
        try {
            const seconds = process.uptime();
            const j = Math.floor(seconds / 86400);
            const h = Math.floor((seconds / 3600) % 24);
            const m = Math.floor((seconds % 3600) / 60);
            const s = Math.floor(seconds % 60);
            let uptime = '';
            if (j > 0) uptime += `${j}J `;
            if (h > 0) uptime += `${h}H `;
            if (m > 0) uptime += `${m}M `;
            if (s > 0) uptime += `${s}S`;

            const lien = `${config.MENU}`;
            const commandes = cmd;
            let menu = `╭───❏ 🄾🅅🄻 🄼🄳 ❏
│ ✿ Prefixe => ${config.PREFIXE}
│ ✿ Owner => ${config.NOM_OWNER}
│ ✿ Commandes => ${commandes.length}
│ ✿ Uptime => ${uptime.trim()}
│ ✿ Développeur => AINZ
╰══════════════⊷\n\n`;

            // Regrouper les commandes par classe
            const cmd_classe = {};
            commandes.forEach((cmd) => {
                if (!cmd_classe[cmd.classe]) {
                    cmd_classe[cmd.classe] = [];
                }
                cmd_classe[cmd.classe].push(cmd);
            });

            // Trier chaque classe par nom_cmd
            for (const [classe, cmds] of Object.entries(cmd_classe)) {
                cmd_classe[classe] = cmds.sort((a, b) =>
                    a.nom_cmd.localeCompare(b.nom_cmd, undefined, { numeric: true })
                );
            }

            // Générer le menu
            for (const [classe, cmds] of Object.entries(cmd_classe)) {
                menu += `╭───❏ ${classe} ❏\n`;
                cmds.forEach((cmd) => {
                    menu += `│☞ ${cmd.nom_cmd}\n`;
                });
                menu += `╰═══════════════⊷\n\n`;
            }

            menu += "> ©2024 OVL-MD WA-BOT";
            await ovl.sendMessage(ms_org, { image: { url: lien }, caption: menu });
        } catch (error) {
            console.error("Erreur lors de la génération du menu :", error);
        }
    }
);


ovlcmd(
    {
        nom_cmd: "vv",
        classe: "Outils",
        react: "👀",
        desc: "Affiche un message envoyé en vue unique",
    },
    async (_ms_org, ovl, _cmd_options) => {
        const { ms, msg_Repondu, repondre } = _cmd_options;

        if (!msg_Repondu) {
            return repondre("Veuillez mentionner un message en vue unique.");
        }

        let _vue_Unique_Message = msg_Repondu.imageMessage || msg_Repondu.videoMessage || msg_Repondu.audioMessage;

        if (!_vue_Unique_Message) {
            return repondre("Le message sélectionné n'est pas en mode vue unique.");
        }

        try {
            let _media;
            let options = { quoted: ms };

            if (msg_Repondu.imageMessage) {
                _media = await ovl.dl_save_media_ms(msg_Repondu.imageMessage);
                await ovl.sendMessage(_ms_org, { image: { url: _media }, caption: msg_Repondu.imageMessage.caption }, options);

            } else if (msg_Repondu.videoMessage) {
                _media = await ovl.dl_save_media_ms(msg_Repondu.videoMessage);
                await ovl.sendMessage(_ms_org, { video: { url: _media }, caption: msg_Repondu.videoMessage.caption }, options);

            } else if (msg_Repondu.audioMessage) {
                _media = await ovl.dl_save_media_ms(msg_Repondu.audioMessage);
                await ovl.sendMessage(_ms_org, { audio: { url: _media }, mimetype: "audio/mp4", ptt: false }, options);

            } else {
                return repondre("Ce type de message n'est pas pris en charge");
            }
        } catch (_error) {
            console.error("Erreur lors de l'envoi du message en vue unique :", _error.message || _error);
        }
    }
);

ovlcmd(
    {
        nom_cmd: "ping",
        classe: "Outils",
        react: "🏓",
        desc: "Mesure la latence du bot.",
    },
    async (ms_org, ovl) => {
        const start = Date.now();
        await ovl.sendMessage(ms_org, { text: "Ping..." });
        const end = Date.now();
        const latency = end - start;
        await ovl.sendMessage(ms_org, { text: `🏓 Pong ! Latence : ${latency}ms` });
    }
);

ovlcmd(
    {
        nom_cmd: "uptime",
        classe: "Outils",
        react: "⏱️",
        desc: "Affiche le temps de fonctionnement du bot.",
        alias: ["upt"],
    },
    async (ms_org, ovl) => {
        const seconds = process.uptime();
        const j = Math.floor(seconds / 86400);
        const h = Math.floor((seconds / 3600) % 24);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        let uptime = '';
        if (j > 0) uptime += `${j}J `;
        if (h > 0) uptime += `${h}H `;
        if (m > 0) uptime += `${m}M `;
        if (s > 0) uptime += `${s}S`;
        await ovl.sendMessage(ms_org, { text: `⏳ Temps de fonctionnement : ${uptime}` });
    }
);

ovlcmd(
    {
        nom_cmd: "translate",
        classe: "Outils",
        react: "🌍",
        desc: "Traduit un texte dans la langue spécifiée.",
        alias: ["trt"],
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms, msg_Repondu } = cmd_options;
        let lang, text;

        if (msg_Repondu && arg.length === 1) {
            lang = arg[0];
            text = msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text;
        } else if (arg.length >= 2) {
            lang = arg[0];
            text = arg.slice(1).join(" ");
        } else {
            return await ovl.sendMessage(ms_org, { text: `Utilisation : ${prefixe}translate <langue> <texte> ou répondre à un message avec : ${prefixe}translate <langue>` });
        }

        try {
            const result = await translate(text, { to: lang });
            await ovl.sendMessage(ms_org, { text: `🌐Traduction (${lang}) :\n${result.text}` }, { quoted: ms });
        } catch (error) {
            console.error("Erreur lors de la traduction:", error);
            await ovl.sendMessage(ms_org, { text: "Erreur lors de la traduction. Vérifiez la langue et le texte fournis." });
        }
    }
);

/*const apiKeys = [
  'eb1ac1cc00374b7eab9ce2cfdc0f32c1',
  '7da8a6dfb4e14b9a94eae88c0e28d91b',
  'd945dda8cec14d93abcfdc34699d6972',
  'ac178ffa00c643dab03d520b20f55834',
  '03cfff7ed6694c7bbb516582d945c996',
  '0884920bcc334ff8974289ee96f03d70',
  'c40c653724d34e6db1f2f4be05a31e90',
  'aad767f8993f42c881b43ba72138d449',
  '970b11fa69ca4edb936a73a74c003380',
  '751ef792c29b465492ec455d6d6e5ddf',
  '3348a0db815243b782fbc88041527d1a',
  '3f1206ea1cc64243bcf975260ab74fd4',
  '8320407ae8b54d5dae19c518dcab5e18',
  '495bb083bc51463faab491fc2226bbba',
  '37bc96866acb47a98bc4ed058684d2db'
];

async function captureScreenshot(url) {
  for (const apiKey of apiKeys) {
    try {
      const apiUrl = `https://api.apiflash.com/v1/urltoimage?access_key=${apiKey}&wait_until=page_loaded&url=${url}`;
      console.log(`Essai avec la clé API: ${apiKey}`); // Log pour vérifier quelle clé est utilisée
      const response = await axios.get(apiUrl, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "GoogleBot",
      },
    });
      console.log('Capture réussie avec la clé API:', apiKey); // Log pour succès
      return response.data;
    } catch (error) {
      console.error(`Erreur avec la clé API ${apiKey}:`, error.message); // Log d'erreur
    }
  }
  throw new Error('Impossible de récupérer la capture d\'écran, toutes les clés API ont échoué.');
}*/

ovlcmd(
  {
    nom_cmd: "capture",
    classe: "Outils",
    react: "📸",
    desc: "Prend une capture d'écran d'un site web.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, prefixe } = cmd_options;

    if (!arg[0]) {
      return ovl.sendMessage(ms_org, {
        text: `Entrez un lien`,
      });
    }

  /*  const url = arg[0];

    try {
      const screenshot = await captureScreenshot(url);

      await ovl.sendMessage(ms_org, {
        image:  Buffer.from(screenshot),
        caption: `Voici la capture d'écran de: ${url}`,
      });
*/
      try { 
          await ovl.sendMessage(ms_org, {
        image: `https://image.thum.io/get/fullpage/${arg[0]}`,
        caption: `Voici la capture d'écran de: ${url}`,
      });
    } catch (error) {
      console.error('Erreur lors de la capture de l\'écran:', error.message); // Log pour l'erreur générale
      return ovl.sendMessage(ms_org, {
        text: "Une erreur est survenue lors de la capture du site. Veuillez réessayer plus tard.",
      });
    }
  }
);

const os = require('os');

ovlcmd(
  {
    nom_cmd: "system_status",
    classe: "Outils",
    react: "🖥️",
    desc: "Affiche les informations du système en temps réel"
  },
  async (ms_org, ovl, cmd_options) => {
    const platform = os.platform();
    const arch = os.arch();
    const cpus = os.cpus();
    const totalMemory = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
    const freeMemory = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
    const hostname = os.hostname();
    const loadAverage = os.loadavg();
    const uptimeSeconds = os.uptime();

    const j = Math.floor(uptimeSeconds / 86400);
    const h = Math.floor((uptimeSeconds / 3600) % 24);
    const m = Math.floor((uptimeSeconds % 3600) / 60);
    const s = Math.floor(uptimeSeconds % 60);
    let uptime = '';
    if (j > 0) uptime += `${j}J `;
    if (h > 0) uptime += `${h}H `;
    if (m > 0) uptime += `${m}M `;
    if (s > 0) uptime += `${s}S`;

    const cpuUsage = cpus.map(cpu => {
      let total = 0;
      for (type in cpu.times) {
        total += cpu.times[type];
      }
      const usage = ((100 - (cpu.times.idle / total) * 100)).toFixed(2);
      return usage + "%";
    }).join(", ");

    const serverSpeed = (100 - loadAverage[0] * 100 / cpus.length).toFixed(2);

    await ovl.sendMessage(ms_org, {
      text: `🖥️ *ÉTAT DU SYSTÈME*\n\n` +
            `⚡ *Vitesse du serveur*: ${serverSpeed} %\n` +
            `🖧 *Charge Moyenne*: ${loadAverage.map(l => l.toFixed(2)).join(", ")}\n` +
            `⏳ *Uptime*: ${uptime.trim()}\n` +
            `💻 *Plateforme*: ${platform}\n` +
            `🔧 *Architecture*: ${arch}\n` +
            `🖧 *Processeur*: ${cpus.length} Cœur(s) (${cpuUsage})\n` +
            `💾 *Mémoire Totale*: ${totalMemory} GB\n` +
            `🆓 *Mémoire Libre*: ${freeMemory} GB\n` +
            `🌐 *Nom de l'Hôte*: ${hostname}\n` +
            `🎉 *Version*: OVL-MD 1.0.0`
    });
  }
);

ovlcmd(
    {
        nom_cmd: "qr",
        classe: "Outils",
        desc: "Génère un QR code pour obtenir une session_id.",
    },
    async (ms_org, ovl, cmd_options) => {
        const { ms } = cmd_options;
        
        try {
            const response = await axios.get(`https://quickest-elise-ainz-oest-org-53269c8e.koyeb.app/qr`);
            const qrImageBase64 = response.data;

            const filePath = path.join(__dirname, 'qr_code.png');  

            fs.writeFile(filePath, qrImageBase64, 'base64', async (err) => {
                if (err) {
                    console.error("Erreur lors de l'écriture du fichier :", err);
                    await ovl.sendMessage(ms_org, { text: "Désolé, il y a eu une erreur lors de la génération du QR code." });
                } else {
                    console.log("Image sauvegardée avec succès !");
                    
                    await ovl.sendMessage(ms_org, {
                        image: { url: filePath, caption: "Scannez ce QR code" }
                    }, { quoted: ms });
                }
            });

        } catch (error) {
            console.error("Erreur lors de la génération du QR code:", error);
            await ovl.sendMessage(ms_org, { text: "Désolé, il y a eu une erreur lors de la génération du QR code." });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "pair",
        classe: "Outils",
        desc: "Génère un pair_code pour obtenir une session_id",
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;
        const bc = arg.join(" ");

        try {
            let response = await axios(`https://quickest-elise-ainz-oest-org-53269c8e.koyeb.app/code?number=${bc}`);
            let code = response.data.code || "indisponible";

            await ovl.sendMessage(ms_org, {
                text: `CODE : ${code}`,
            }, { quoted: ms });
        } catch (error) {
            console.error("Erreur lors de la génération du code:", error);
            await ovl.sendMessage(ms_org, { text: "Désolé, il y a eu une erreur lors de la génération du code." });
        }
    }
);

