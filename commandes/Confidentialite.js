

ovlcmd(
    {
        nom_cmd: "save",
        classe: "Outils",
        react: "💾",
        desc: "Télécharge un statut WhatsApp",
    },
    async (ms_org, ovl, _cmd_options) => {
        const { ms, msg_Repondu, repondre } = _cmd_options;
        
        if (ms_org !== "status@broadcast") {
            return repondre("Cette commande ne fonctionne que sur les statuts WhatsApp.");
        }

        try {
            let media, options = { quoted: ms };
            
            if (ms.message.extendedTextMessage) {
                await ovl.sendMessage(ovl.user.id, { text: ms.message.extendedTextMessage.text }, options);
            } else if (ms.message.imageMessage) {
                media = await ovl.dl_save_media_ms(ms.message.imageMessage);
                await ovl.sendMessage(ovl.user.id, { image: { url: media }, caption: ms.message.imageMessage.caption }, options);
            } else if (ms.message.videoMessage) {
                media = await ovl.dl_save_media_ms(ms.message.videoMessage);
                await ovl.sendMessage(ovl.user.id, { video: { url: media }, caption: ms.message.videoMessage.caption }, options);
            } else if (ms.message.audioMessage) {
                media = await ovl.dl_save_media_ms(ms.message.audioMessage);
                await ovl.sendMessage(id_Bot, { audio: { url: media }, mimetype: "audio/mp4", ptt: false }, options);
            } else {
                return repondre("Ce type de statut n'est pas pris en charge.");
            }
        } catch (_error) {
            console.error("Erreur lors du téléchargement du statut :", _error.message || _error);
        }
    }
);
