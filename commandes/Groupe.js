const { ovlcmd } = require("../framework/ovlcmd");
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { Antilink } = require("../DataBase/antilink");
const { Antibot } = require("../DataBase/antibot");
const { GroupSettings } = require("../DataBase/events");
const fs = require("fs");

ovlcmd(
    {
        nom_cmd: "tagall",
        classe: "Groupe",
        react: "💬",
        desc: "Commande pour taguer tous les membres d'un groupe"
    },
    async (dest, ovl, cmd_options) => {
        try {
            const { ms, repondre, arg, verif_Groupe, infos_Groupe, nom_Auteur_Message, verif_Admin } = cmd_options;

            if (!verif_Groupe) {
                return repondre("Cette commande ne fonctionne que dans les groupes");
            }

            const messageTexte = arg && arg.length > 0 ? arg.join(' ') : '';
            const membresGroupe = verif_Groupe ? await infos_Groupe.participants : [];
            
            let tagMessage = `╭───〔  TAG ALL 〕───⬣\n`;
            tagMessage += `│👤 Auteur : *${nom_Auteur_Message}*\n`;
            tagMessage += `│💬 Message : *${messageTexte}*\n│\n`;

            membresGroupe.forEach(membre => {
                tagMessage += `│◦❒ @${membre.id.split("@")[0]}\n`;
            });
            tagMessage += `╰═══════════════⬣\n`;

            if (verif_Admin) {
                await ovl.sendMessage(dest, { text: tagMessage, mentions: membresGroupe.map(m => m.id) }, { quoted: ms });
            } else {
                repondre('Seuls les administrateurs peuvent utiliser cette commande');
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi du message avec tagall :", error);
        }
    });

ovlcmd(
    {
        nom_cmd: "tagadmin",
        classe: "Groupe",
        react: "💬",
        desc: "Commande pour taguer tous les administrateurs d'un groupe"
    },
    async (dest, ovl, cmd_options) => {
        try {
            const { ms, repondre, arg, verif_Groupe, infos_Groupe, nom_Auteur_Message, verif_Admin } = cmd_options;

            if (!verif_Groupe) {
                return repondre("Cette commande ne fonctionne que dans les groupes");
            }

            const messageTexte = arg && arg.length > 0 ? arg.join(' ') : '';
            const membresGroupe = verif_Groupe ? await infos_Groupe.participants : [];
            const adminsGroupe = membresGroupe.filter(membre => membre.admin).map(membre => membre.id);

            if (adminsGroupe.length === 0) {
                return repondre("Aucun administrateur trouvé dans ce groupe.");
            }

            let tagMessage = `╭───〔  TAG ADMINS 〕───⬣\n`;
            tagMessage += `│👤 Auteur : *${nom_Auteur_Message}*\n`;
            tagMessage += `│💬 Message : *${messageTexte}*\n│\n`;

            membresGroupe.forEach(membre => {
                if (membre.admin) {
                    tagMessage += `│◦❒ @${membre.id.split("@")[0]}\n`;
                }
            });
            tagMessage += `╰═══════════════⬣\n`;

            if (verif_Admin) {
                await ovl.sendMessage(dest, { text: tagMessage, mentions: adminsGroupe }, { quoted: ms });
            } else {
                repondre('Seuls les administrateurs peuvent utiliser cette commande');
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi du message avec tagadmins :", error);
        }
    });

ovlcmd(
    {
        nom_cmd: "tag",
        classe: "Groupe",
        react: "💬",
        desc: "partager un message à tous les membres d'un groupe"

    },
    async (dest, ovl, cmd_options) => {
        const { repondre, msg_Repondu, verif_Groupe, arg, verif_Admin } = cmd_options;

        if (!verif_Groupe) {
            repondre("Cette commande ne fonctionne que dans les groupes");
            return;
        }

        if (verif_Admin) {
            let metadata_groupe = await ovl.groupMetadata(dest);
            let membres_Groupe = metadata_groupe.participants.map(participant => participant.id);
            let contenu_msg;

            if (msg_Repondu) {
                if (msg_Repondu.imageMessage) {
                    let media_image = await ovl.dl_save_media_ms(msg_Repondu.imageMessage);
                    contenu_msg = {
                        image: { url: media_image },
                        caption: msg_Repondu.imageMessage.caption,
                        mentions: membres_Groupe
                    };
                } else if (msg_Repondu.videoMessage) {
                    let media_video = await ovl.dl_save_media_ms(msg_Repondu.videoMessage);
                    contenu_msg = {
                        video: { url: media_video },
                        caption: msg_Repondu.videoMessage.caption,
                        mentions: membres_Groupe
                    };
                } else if (msg_Repondu.audioMessage) {
                    let media_audio = await ovl.dl_save_media_ms(msg_Repondu.audioMessage);
                    contenu_msg = {
                        audio: { url: media_audio },
                        mimetype: 'audio/mp4',
                        mentions: membres_Groupe
                    };
                } else if (msg_Repondu.stickerMessage) {
                    let media_sticker = await ovl.dl_save_media_ms(msg_Repondu.stickerMessage);
                    let sticker_msg = new Sticker(media_sticker, {
                        pack: 'OVL-MD Hidtag',
                        type: StickerTypes.FULL,
                        quality: 80,
                        background: "transparent",
                    });
                    const sticker_buffer = await sticker_msg.toBuffer();
                    contenu_msg = { sticker: sticker_buffer, mentions: membres_Groupe };
                } else {
                    contenu_msg = {
                        text: msg_Repondu.conversation,
                        mentions: membres_Groupe
                    };
                }

                ovl.sendMessage(dest, contenu_msg);
            } else {
                if (!arg || !arg[0]) {
                    repondre("Veuillez inclure ou mentionner un message à partager.");
                    return;
                }

                ovl.sendMessage(dest, {
                    text: arg.join(' '),
                    mentions: membres_Groupe
                });
            }
        } else {
            repondre("Cette commande est réservée aux administrateurs du groupe");
        }
    }
);

ovlcmd(
  {
    nom_cmd: "poll",
    classe: "Groupe",
    react: "📊",
    desc: "Crée un sondage dans le groupe.",
  },
  async (dest, ovl, cmd_options) => {
    try {
      const { ms, repondre, arg, verif_Groupe, infos_Groupe, nom_Auteur_Message, verif_Admin } = cmd_options;

      if (!verif_Groupe) {
        return repondre("Cette commande ne fonctionne que dans les groupes.");
      }

      let [pollName, pollOptions] = arg.join(' ').split(';');

      if (!pollOptions) {
        return repondre("Veuillez fournir une question suivie des options, séparées par des virgules. Exemple : poll question;option1,option2,option3");
      }

      let options = pollOptions.split(',').map(option => option.trim()).filter(option => option.length > 0);

      if (options.length < 2) {
        return repondre("Le sondage doit contenir au moins deux options.");
      }
      
      if (verif_Admin) {
        await ovl.sendMessage(dest, {
          poll: {
            name: pollName,
            values: options,
          },
        }, { quoted: ms });
      } else {
        repondre('Seuls les administrateurs peuvent utiliser cette commande.');
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du sondage :", error);
      repondre("Une erreur est survenue lors de la création du sondage.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "kick",
    classe: "Groupe",
    react: "🛑",
    desc: "Supprime un membre du groupe.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { verif_Groupe, auteur_Msg_Repondu, arg, infos_Groupe, verif_Admin, verif_Ovl_Admin, prenium_id, dev_num } = cmd_options;
    if (!verif_Groupe) return ovl.sendMessage(ms_org, { text: "Commande utilisable uniquement dans les groupes." });
    if (prenium_id || verif_Admin) {
    const membres = await infos_Groupe.participants;
    const admins = membres.filter((m) => m.admin).map((m) => m.id);
    const membre = auteur_Msg_Repondu || (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@s.whatsapp.net`);
      if (!verif_Ovl_Admin)
      return ovl.sendMessage(ms_org, { text: "Je dois être administrateur pour effectuer cette action." });

     if (!membre || !membres.find((m) => m.id === membre))
      return ovl.sendMessage(ms_org, { text: "Membre introuvable dans ce groupe." });
    if (admins.includes(membre))
      return ovl.sendMessage(ms_org, { text: "Impossible d'exclure un administrateur du groupe." });
    if (dev_num.includes(membre)) {
      return ovl.sendMessage(ms_org, { text: "Vous ne pouvez pas exclure un développeur." });
    }
    try {
      await ovl.groupParticipantsUpdate(ms_org, [membre], "remove");
      ovl.sendMessage(ms_org, { text: `@${membre.split("@")[0]} a été exclu.`, mentions: [membre] });
    } catch (err) {
      console.error("Erreur :", err);
      ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de l'exclusion." });
    }
    } else { return ovl.sendMessage(ms_org, { text: "Vous n'avez pas la permission d'utiliser cette commande." });
           };
  }
);

ovlcmd(
  {
    nom_cmd: "kickall",
    classe: "Groupe",
    react: "🛑",
    desc: "Supprime tous les membres non administrateurs du groupe.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { verif_Groupe, verif_Admin, verif_Ovl_Admin, infos_Groupe, prenium_id, dev_id } = cmd_options;
    
    if (!verif_Groupe) return ovl.sendMessage(ms_org, { text: "Commande utilisable uniquement dans les groupes." });
    
    if (prenium_id || verif_Admin) {
      const membres = await infos_Groupe.participants;
      const admins = membres.filter((m) => m.admin).map((m) => m.id);
      
      if (!verif_Ovl_Admin) {
        return ovl.sendMessage(ms_org, { text: "Je dois être administrateur pour effectuer cette action." });
      } 
      const settings = await GroupSettings.findOne({ where: { id: ms_org } });
      const { goodbye } = settings;
      if (goodbye === 'oui') {
          return ovl.sendMessage(ms_org, { text: "Désactivez le goodbye message (goodbye off) avant de continuer"});
      }
      const nonAdmins = membres.filter((m) => !m.admin && !dev_id.includes(m.id)).map((m) => m.id);

      if (nonAdmins.length === 0) {
        return ovl.sendMessage(ms_org, { text: "Il n'y a aucun membre non administrateur à exclure." });
      }

      try {
        await ovl.groupParticipantsUpdate(ms_org, nonAdmins, "remove");
        ovl.sendMessage(ms_org, { text: "Tous les membres non administrateurs ont été exclus du groupe." });
      } catch (err) {
        console.error("Erreur :", err);
        ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de l'exclusion des membres non administrateurs." });
      }
    } else {
      return ovl.sendMessage(ms_org, { text: "Vous n'avez pas la permission d'utiliser cette commande." });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "ckick",
    classe: "Groupe",
    react: "🛑",
    desc: "Supprime tous les membres non administrateurs dont le JID commence par un indicatif spécifique.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { verif_Groupe, verif_Admin, verif_Ovl_Admin, infos_Groupe, prenium_id, arg, dev_id } = cmd_options;
    
    if (!verif_Groupe) 
      return ovl.sendMessage(ms_org, { text: "Commande utilisable uniquement dans les groupes." });
    
    if (prenium_id || verif_Admin) {
      if (!arg[0]) 
        return ovl.sendMessage(ms_org, { text: "Veuillez spécifier l'indicatif." });

      const indicatif = arg[0];
      const membres = await infos_Groupe.participants;

      if (!verif_Ovl_Admin) {
        return ovl.sendMessage(ms_org, { text: "Je dois être administrateur pour effectuer cette action." });
      }
        const membresToKick = membres
        .filter((m) => m.id.startsWith(indicatif) && !m.admin && !dev_id.includes(m.id))
        .map((m) => m.id);

      if (membresToKick.length === 0) {
        return ovl.sendMessage(ms_org, { text: `Aucun membre non administrateur trouvé avec l'indicatif ${indicatif}.` });
      }
      if (dev_num.includes(auteur_Msg_Repondu) && !dev_id) {
      return ovl.sendMessage(ms_org, { text: "Vous ne pouvez pas supprimer un développeur." });
      }
      try {
        await ovl.groupParticipantsUpdate(ms_org, membresToKick, "remove");
        ovl.sendMessage(ms_org, { text: `Tous les membres non administrateurs dont le JID commence par ${indicatif} ont été exclus du groupe.` });
      } catch (err) {
        console.error("Erreur :", err);
        ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de l'exclusion des membres." });
      }
    } else {
      return ovl.sendMessage(ms_org, { text: "Vous n'avez pas la permission d'utiliser cette commande." });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "promote",
    classe: "Groupe",
    react: "⬆️",
    desc: "Promouvoir un membre comme administrateur.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { verif_Groupe, auteur_Msg_Repondu, arg, infos_Groupe, verif_Admin, prenium_id, verif_Ovl_Admin } = cmd_options;
    if (!verif_Groupe) return ovl.sendMessage(ms_org, { text: "Commande utilisable uniquement dans les groupes." });
    if (verif_Admin || prenium_id) {
    const membres = await infos_Groupe.participants;
    const admins = membres.filter((m) => m.admin).map((m) => m.id);
    const membre = auteur_Msg_Repondu || (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@s.whatsapp.net`);
    if (!verif_Ovl_Admin)
      return ovl.sendMessage(ms_org, { text: "Je dois être administrateur pour effectuer cette action." });
    if (!membre) return ovl.sendMessage(ms_org, { text: "Veuillez mentionner un membre à promouvoir." });
    if (!membres.find((m) => m.id === membre))
      return ovl.sendMessage(ms_org, { text: "Membre introuvable dans ce groupe." });
    if (admins.includes(membre))
      return ovl.sendMessage(ms_org, { text: "ce membre est déjà un administrateur du groupe." });

    try {
      await ovl.groupParticipantsUpdate(ms_org, [membre], "promote");
      ovl.sendMessage(ms_org, { text: `@${membre.split("@")[0]} a été promu administrateur.`, mentions: [membre] });
    } catch (err) {
      console.error("Erreur :", err);
      ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de la promotion." });
    }
    } else { return ovl.sendMessage(ms_org, { text: "Vous n'avez pas la permission d'utiliser cette commande." });
           }
  }
);

ovlcmd(
  {
    nom_cmd: "demote",
    classe: "Groupe",
    react: "⬇️",
    desc: "Retirer le rôle d'administrateur à un membre.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { verif_Groupe, auteur_Msg_Repondu, arg, infos_Groupe, verif_Admin, prenium_id, verif_Ovl_Admin, dev_num, dev_id } = cmd_options;
    if (!verif_Groupe) return ovl.sendMessage(ms_org, { text: "Commande utilisable uniquement dans les groupes." });
    if (verif_Admin || prenium_id) { 
    const membres = await infos_Groupe.participants;
    const admins = membres.filter((m) => m.admin).map((m) => m.id);
    const membre = auteur_Msg_Repondu || (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@s.whatsapp.net`);
    if (!verif_Ovl_Admin)
      return ovl.sendMessage(ms_org, { text: "Je dois être administrateur pour effectuer cette action." });
    if (!membre) return ovl.sendMessage(ms_org, { text: "Veuillez mentionner un membre à rétrograder." });
    if (!membres.find((m) => m.id === membre))
      return ovl.sendMessage(ms_org, { text: "Membre introuvable dans ce groupe." });
    if (!admins.includes(membre))
      return ovl.sendMessage(ms_org, { text: "ce membre n'est pas un administrateur du groupe." });
    
      if (dev_num.includes(membre)) {
      return ovl.sendMessage(ms_org, { text: "Vous ne pouvez pas rétrograder un développeur." });
    }

    try {
      await ovl.groupParticipantsUpdate(ms_org, [membre], "demote");
      ovl.sendMessage(ms_org, { text: `@${membre.split("@")[0]} a été rétrogradé.`, mentions: [membre] });
    } catch (err) {
      console.error("Erreur :", err);
      ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de la rétrogradation." });
    }
    } else { return ovl.sendMessage(ms_org, { text: "Vous n'avez pas la permission d'utiliser cette commande." });
           }
  }
);

ovlcmd(
  {
    nom_cmd: "del",
    classe: "Groupe",
    react: "🗑️",
    desc: "Supprimer un message dans le groupe.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { msg_Repondu, ms, auteur_Msg_Repondu, verif_Admin, verif_Ovl_Admin, verif_Groupe, id_Bot, dev_num, dev_id } = cmd_options;

    if (!verif_Groupe) {
      return ovl.sendMessage(ms_org, { text: "Commande utilisable uniquement dans les groupes." });
    }

    if (!verif_Admin) {
      return ovl.sendMessage(ms_org, { text: "Vous devez être administrateur pour utiliser cette commande." });
    }

    if (!verif_Ovl_Admin) {
      return ovl.sendMessage(ms_org, { text: "Je dois être administrateur pour effectuer cette action." });
    }

    if (!msg_Repondu) {
      return ovl.sendMessage(ms_org, { text: "Veuillez répondre à un message pour le supprimer." });
    }
   
      if (dev_num.includes(auteur_Msg_Repondu) && !dev_id) {
      return ovl.sendMessage(ms_org, { text: "Vous ne pouvez pas supprimer le message d'un développeur." });
    }

    try {
      const key = {
        remoteJid: ms_org,
        fromMe: auteur_Msg_Repondu === id_Bot,
        id: ms.message.extendedTextMessage.contextInfo.stanzaId,
        participant: auteur_Msg_Repondu,
      };

      await ovl.sendMessage(ms_org, { delete: key });
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      ovl.sendMessage(ms_org, { text: `Erreur lors de la suppression : ${error.message}` });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "gcreate",
    classe: "Groupe",
    react: "✅",
    desc: "Permet de créer un groupe et d'y ajouter des membres mentionnés.",
  },
  async (jid, ovl, cmd_options) => {
    const { arg, prenium_id, auteur_Msg_Repondu } = cmd_options;

    if (!prenium_id) {
      return ovl.sendMessage(jid, { text: `Vous n'avez pas les permissions requises pour créer un groupe.` });
    }

    if (arg.length === 0 && !auteur_Msg_Repondu) {
      return ovl.sendMessage(jid, { text: `Veuillez fournir un nom pour le groupe et mentionner des membres ou répondre à un message contenant des tags.` });
    }

    const name = arg[0];
    const membres = [];

    if (arg.length > 1) {
      arg.slice(1).forEach((tag) => {
        if (tag.startsWith("@")) {
          membres.push(`${tag.replace("@", "")}@s.whatsapp.net`);
        }
      });
    }

    if (membres.length === 0 && auteur_Msg_Repondu) {
      auteur_Msg_Repondu.mentions.forEach((mention) => {
        membres.push(mention);
      });
    }

    if (membres.length === 0) {
      return ovl.sendMessage(jid, { text: `Aucun membre mentionné ou tagué trouvé pour ajouter au groupe.` });
    }

    try {
      const group = await ovl.groupCreate(name, membres);
      await ovl.sendMessage(group.id, { text: `Groupe "${name}" créé avec succès ! 🎉` });
    } catch (err) {
      console.error("Erreur lors de la création du groupe :", err);
      await ovl.sendMessage(jid, { text: `Une erreur est survenue lors de la création du groupe. Veuillez réessayer.` });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "gdesc",
    classe: "Groupe",
    react: "🔤",
    desc: "Permet de changer la description d'un groupe",
  },
  async (jid, ovl, cmd_options) => {
    const { verif_Groupe, verif_Admin, verif_Ovl_Admin, msg_Repondu, arg } = cmd_options;

    if (!verif_Groupe) return ovl.sendMessage(jid, { text: "Commande utilisable uniquement dans les groupes." });

    if (verif_Admin && verif_Ovl_Admin) {
      let desc;
      if (msg_Repondu) {
        desc = msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text;
      } else if (arg) {
        desc = arg.join(' ');
      } else {
        return ovl.sendMessage(jid, { text: "Entrez la nouvelle description." });
      }

      await ovl.groupUpdateDescription(jid, desc);
    } else { ovl.sendMessage(jid, { text: 'je n\'ai pas les droits requis pour exécuter cette commande' }) }
  }
);

ovlcmd(
  {
    nom_cmd: "gname",
    classe: "Groupe",
    react: "🔤",
    desc: "Permet de changer le nom d'un groupe",
  },
  async (jid, ovl, cmd_options) => {
    const { verif_Groupe, verif_Admin, verif_Ovl_Admin, msg_Repondu, arg } = cmd_options;

    if (!verif_Groupe) return ovl.sendMessage(jid, { text: "Commande utilisable uniquement dans les groupes." });

    if (verif_Admin && verif_Ovl_Admin) {
      let name;
      if (msg_Repondu) {
        name = msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text;
      } else if (arg) {
        name = arg.join(' ');
      } else {
        return ovl.sendMessage(jid, { text: "Entrez un nouveau nom" });
      }

      await ovl.groupUpdateSubject(jid, name);
    } else { ovl.sendMessage(jid, { text: 'je n\'ai pas les droits requis pour exécuter cette commande' }) }
  }
);

ovlcmd(
  {
    nom_cmd: "close",
    classe: "Groupe",
    react: "✅",
    desc: "Seuls les admins peuvent envoyer des messages",
  },
  async (jid, ovl, cmd_options) => {
    const { verif_Groupe, verif_Admin, verif_Ovl_Admin } = cmd_options;

    if (!verif_Groupe) 
      return ovl.sendMessage(jid, { text: "Commande utilisable uniquement dans les groupes." });

    if (!verif_Admin || !verif_Ovl_Admin)
      return ovl.sendMessage(jid, { text: "Je n'ai pas les droits requis pour exécuter cette commande." });

    await ovl.groupSettingUpdate(jid, "announcement");
    return ovl.sendMessage(jid, { text: "Mode défini : seuls les admins peuvent envoyer des messages." });
  }
);

ovlcmd(
  {
    nom_cmd: "open",
    classe: "Groupe",
    react: "✅",
    desc: "Tout le monde peut envoyer des messages",
  },
  async (jid, ovl, cmd_options) => {
    const { verif_Groupe, verif_Admin, verif_Ovl_Admin } = cmd_options;

    if (!verif_Groupe) 
      return ovl.sendMessage(jid, { text: "Commande utilisable uniquement dans les groupes." });

    if (!verif_Admin || !verif_Ovl_Admin)
      return ovl.sendMessage(jid, { text: "Je n'ai pas les droits requis pour exécuter cette commande." });

    await ovl.groupSettingUpdate(jid, "not_announcement");
    return ovl.sendMessage(jid, { text: "Mode défini : tout le monde peut envoyer des messages." });
  }
);

ovlcmd(
  {
    nom_cmd: "lock",
    classe: "Groupe",
    react: "✅",
    desc: "Tout le monde peut modifier les paramètres du groupe",
  },
  async (jid, ovl, cmd_options) => {
    const { verif_Groupe, verif_Admin, verif_Ovl_Admin } = cmd_options;

    if (!verif_Groupe) 
      return ovl.sendMessage(jid, { text: "Commande utilisable uniquement dans les groupes." });

    if (!verif_Admin || !verif_Ovl_Admin)
      return ovl.sendMessage(jid, { text: "Je n'ai pas les droits requis pour exécuter cette commande." });
      
    await ovl.groupSettingUpdate(jid, "unlocked");
    return ovl.sendMessage(jid, { text: "Mode défini : tout le monde peut modifier les paramètres du groupe." });
  }
);

ovlcmd(
  {
    nom_cmd: "unlock",
    classe: "Groupe",
    react: "✅",
    desc: "Seuls les admins peuvent modifier les paramètres du groupe",
  },
  async (jid, ovl, cmd_options) => {
    const { verif_Groupe, verif_Admin, verif_Ovl_Admin } = cmd_options;

    if (!verif_Groupe) 
      return ovl.sendMessage(jid, { text: "Commande utilisable uniquement dans les groupes." });

    if (!verif_Admin || !verif_Ovl_Admin)
      return ovl.sendMessage(jid, { text: "Je n'ai pas les droits requis pour exécuter cette commande." });

    await ovl.groupSettingUpdate(jid, "locked");
    return ovl.sendMessage(jid, { text: "Mode défini : seuls les admins peuvent modifier les paramètres du groupe." });
  }
);

ovlcmd(
  {
    nom_cmd: "leave",
    classe: "Groupe",
    react: "😐",
    desc: "Commande pour quitter un groupe",
  },
  async (jid, ovl, cmd_options) => {
    const { prenium_id } = cmd_options;
    if (!prenium_id) {
      return ovl.sendMessage(jid, { text: "Vous n'avez pas les permissions requises pour quitter ce groupe." });
    }
    await ovl.sendMessage(jid, { text: "Sayonara" });
    await ovl.groupLeave(jid);
  }
);

ovlcmd(
  {
    nom_cmd: "link",
    classe: "Groupe",
    react: "🔗",
    desc: "Permet d'obtenir le lien d'invitation d'un groupe",
  },
  async (jid, ovl, cmd_options) => {
    const { verif_Groupe, verif_Admin, verif_Ovl_Admin } = cmd_options;
    if (!verif_Groupe) return ovl.sendMessage(jid, { text: "Commande utilisable uniquement dans les groupes." });
    if (verif_Admin && verif_Ovl_Admin) {
      const code = await ovl.groupInviteCode(jid);
      await ovl.sendMessage(jid, { text: `Lien d'invitation: https://chat.whatsapp.com/${code}` });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "revoke",
    classe: "Groupe",
    react: "🔗",
    desc: "Réinitialise le lien d'invitation d'un groupe",
  },
  async (jid, ovl, cmd_options) => {
    const { verif_Groupe, verif_Admin, verif_Ovl_Admin } = cmd_options;
    if (!verif_Groupe) return ovl.sendMessage(jid, { text: "Commande utilisable uniquement dans les groupes." });
    if (verif_Admin && verif_Ovl_Admin) {
      await ovl.groupRevokeInvite(jid);
      await ovl.sendMessage(jid, { text: 'Le lien d\'invitation a été Réinitialisé.' });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "ginfo",
    classe: "Groupe",
    react: "🔎",
    desc: "Affiche les informations du groupe",
  },
  async (jid, ovl, cmd_options) => {
    const metadata = await ovl.groupMetadata(jid);
    await ovl.sendMessage(jid, { text: `ID: ${metadata.id}\nNom: ${metadata.subject}\nDescription: ${metadata.desc}` });
  }
);

ovlcmd(
  {
    nom_cmd: "join",
    classe: "Groupe",
    react: "😶‍🌫",
    desc: "Permet de rejoindre un groupe via un lien d'invitation",
  },
  async (jid, ovl, cmd_options) => {
    const { prenium_id, arg } = cmd_options;
    if (!prenium_id) {
      return ovl.sendMessage(jid, { text: `Vous n'avez pas les permissions requises pour rejoindre un groupe.` });
    }
    if (!arg) return ovl.sendMessage(jid, { text: 'Veuillez fournir le lien d\'invitation du groupe.' });
    const invite = arg.join("");
    const code = invite.split('/')[3];
    await ovl.groupAcceptInvite(code);
    await ovl.sendMessage(jid, { text: 'Vous avez rejoint le groupe avec succès.' });
  }
);

ovlcmd(
  {
    nom_cmd: "acceptall",
    classe: "Groupe",
    react: "👨🏿‍💻",
    desc: "Accepter toutes les demandes en attente d'un groupe",
  },
  async (jid, ovl, cmd_options) => {
    const { verif_Admin, prenium_id, verif_Ovl_Admin, verif_Groupe } = cmd_options;
    if (!verif_Groupe) return ovl.sendMessage(jid, { text: "Commande réservée aux groupes uniquement." });
    if (!verif_Admin && !prenium_id) return ovl.sendMessage(jid, { text: "Vous n'avez pas les permissions pour utiliser cette commande." });
    if (!verif_Ovl_Admin) return ovl.sendMessage(jid, { text: "Je dois être administrateur pour effectuer cette action." });

    try {
      await ovl.groupRequestParticipantsUpdate(jid, "approve");
      ovl.sendMessage(jid, { text: "Toutes les demandes ont été acceptées." });
    } catch (err) {
      ovl.sendMessage(jid, { text: "Une erreur est survenue lors de l'acceptation des demandes." });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "rejectall",
    classe: "Groupe",
    react: "👨🏿‍💻",
    desc: "Rejeter toutes les demandes en attente d'un groupe",
  },
  async (jid, ovl, cmd_options) => {
    const { verif_Admin, prenium_id, verif_Ovl_Admin, verif_Groupe } = cmd_options;
    if (!verif_Groupe) return ovl.sendMessage(jid, { text: "Commande réservée aux groupes uniquement." });
    if (!verif_Admin && !prenium_id) return ovl.sendMessage(jid, { text: "Vous n'avez pas les permissions pour utiliser cette commande." });
    if (!verif_Ovl_Admin) return ovl.sendMessage(jid, { text: "Je dois être administrateur pour effectuer cette action." });

    try {
      await ovl.groupRequestParticipantsUpdate(jid, "reject");
      ovl.sendMessage(jid, { text: "Toutes les demandes ont été rejetées." });
    } catch (err) {
      ovl.sendMessage(jid, { text: "Une erreur est survenue lors du rejet des demandes." });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "gpp",
    classe: "Groupe",
    react: "🎨",
    desc: "Commande pour changer la pp d'un groupe",
  },
  async (jid, ovl, cmd_options) => {
    const { arg, verif_Groupe } = cmd_options;
    if (!verif_Groupe) {
      return ovl.sendMessage(jid, { text: `Vous n'avez pas les permissions requises pour quitter ce groupe.` });
    }; if(!arg) { ovl.sendMessage(jid, { text: `Mentionnez un lien` });
      const url = arg.join(' ');
                 try {
    await ovl.updateProfilePicture(jid, { url: url })
                 } catch (error) {
                     console.error(error);
                }
  }}
);

ovlcmd(
  {
    nom_cmd: "vcf",
    classe: "Groupe",
    react: "📇",
    desc: "Enregistre les contacts de tous les membres du groupe dans un fichier VCF",
  },
  async (ms_org, ovl, cmd_options) => {
    const { verif_Groupe } = cmd_options;

    try {
      if (!verif_Groupe) return ovl.sendMessage(ms_org, { text: "Cette commande doit être utilisée dans un groupe." });
        
      const groupMetadata = await ovl.groupMetadata(ms_org).catch((e) => null);

      if (!groupMetadata || !groupMetadata.participants) {
        return ovl.sendMessage(ms_org, { text: 'Échec de la récupération des métadonnées du groupe ou de la liste des participants.' });
      }

      const participants = groupMetadata.participants;
      const vcfData = [];

      for (const participant of participants) {
        const number = participant.id.split('@')[0];
        vcfData.push(`BEGIN:VCARD\nVERSION:3.0\nFN:${number}\nTEL;TYPE=CELL:${number}\nEND:VCARD`);
      }

      const groupName = groupMetadata.subject || `Groupe ${ms_org.key.remoteJid}`;
      const vcfFileName = `contacts_groupe_${groupName}.vcf`;
      const vcfFilePath = `./${vcfFileName}`;
      
      fs.writeFileSync(vcfFilePath, vcfData.join('\n'));

      const message = `*TOUS LES CONTACTS DES MEMBRES ENREGISTRÉS*\nGroupe : *${groupName}*\nContacts : *${participants.length}*`;

      const vcfFile = fs.readFileSync(vcfFilePath);
      await ovl.sendMessage(ms_org, { document: vcfFile, mimetype: 'text/vcard', filename: vcfFileName, caption: message });

      fs.unlinkSync(vcfFilePath); 
    } catch (error) {
      console.error('Erreur lors du traitement de la commande vcf:', error);
      return ovl.sendMessage(ms_org, { text: 'Une erreur est survenue lors du traitement de la commande vcf.' });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "antilink",
    classe: "Groupe",
    react: "🔗",
    desc: "Active ou configure l'antilink pour les groupes",
  },
  async (jid, ovl, cmd_options) => {
      const { ms, repondre, arg, verif_Groupe, verif_Admin } = cmd_options;
    try {
      
      if (!verif_Groupe) {
        return repondre("Cette commande ne fonctionne que dans les groupes");
      }

      if (!verif_Admin) {
        return repondre("Seuls les administrateurs peuvent utiliser cette commande");
      }

      const sousCommande = arg[0]?.toLowerCase();
      const validModes = ['on', 'off'];
      const validTypes = ['supp', 'warn', 'kick'];

      const [settings] = await Antilink.findOrCreate({
        where: { id: jid },
        defaults: { id: jid, mode: 'non', type: 'supp' },
      });

      if (validModes.includes(sousCommande)) {
        const newMode = sousCommande === 'on' ? 'oui' : 'non';
        if (settings.mode === newMode) {
          return repondre(`L'Antilink est déjà ${sousCommande}`);
        }
        settings.mode = newMode;
        await settings.save();
        return repondre(`L'Antilink ${sousCommande === 'on' ? 'activé' : 'désactivé'} avec succès !`);
      }

      if (validTypes.includes(sousCommande)) {
        if (settings.mode !== 'oui') {
          return repondre("Veuillez activer l'antilink d'abord en utilisant `antilink on`");
        }
        if (settings.type === sousCommande) {
          return repondre(`L'action antilink est déjà définie sur ${sousCommande}`);
        }
        settings.type = sousCommande;
        await settings.save();
        return repondre(`L'Action de l'antilink définie sur ${sousCommande} avec succès !`);
      }

      return repondre(
        "Utilisation :\n" +
        "antilink on/off: Activer ou désactiver l'antilink\n" +
        "antilink supp/warn/kick: Configurer l'action antilink"
      );
    } catch (error) {
      console.error("Erreur lors de la configuration d'antilink :", error);
      repondre("Une erreur s'est produite lors de l'exécution de la commande.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "antibot",
    classe: "Groupe",
    react: "🔗",
    desc: "Active ou configure l'antibot pour les groupes",
  },
  async (jid, ovl, cmd_options) => {
    const { repondre, arg, verif_Groupe, verif_Admin } = cmd_options;

    try {
      if (!verif_Groupe) {
        return repondre("❌ Cette commande fonctionne uniquement dans les groupes.");
      }

      if (!verif_Admin) {
        return repondre("❌ Seuls les administrateurs peuvent utiliser cette commande.");
      }

      const sousCommande = arg[0]?.toLowerCase();
      const validModes = ["on", "off"];
      const validTypes = ["supp", "warn", "kick"];

      const [settings] = await Antibot.findOrCreate({
        where: { id: jid },
        defaults: { id: jid, mode: "non", type: "supp" },
      });

      if (validModes.includes(sousCommande)) {
        const newMode = sousCommande === "on" ? "oui" : "non";
        if (settings.mode === newMode) {
          return repondre(`L'Antibot est déjà ${sousCommande}.`);
        }
        settings.mode = newMode;
        await settings.save();
        return repondre(`L'Antibot a été ${sousCommande === "on" ? "activé" : "désactivé"} avec succès !`);
      }

      if (validTypes.includes(sousCommande)) {
        if (settings.mode !== "oui") {
          return repondre("❌ Veuillez activer l'antibot d'abord avec `antibot on`.");
        }
        if (settings.type === sousCommande) {
          return repondre(`⚠️ L'action antibot est déjà définie sur ${sousCommande}.`);
        }
        settings.type = sousCommande;
        await settings.save();
        return repondre(`✅ L'action antibot est maintenant définie sur ${sousCommande}.`);
      }

      return repondre(
        "Utilisation :\n" +
          "antibot on/off : Activer ou désactiver l'antibot.\n" +
          "antibot supp/warn/kick : Configurer l'action antibot."
      );
    } catch (error) {
      console.error("Erreur lors de la configuration d'antibot :", error);
      return repondre("❌ Une erreur s'est produite lors de l'exécution de la commande.");
    }
  }
);

const commands = [
  {
    nom_cmd: "welcome",
    react: "👋",
    desc: "Active ou désactive les messages de bienvenue",
  },
  {
    nom_cmd: "goodbye",
    react: "👋",
    desc: "Active ou désactive les messages d'adieu",
  },
  {
    nom_cmd: "antipromote",
    react: "🛑",
    desc: "Active ou désactive l'antipromotion",
  },
  {
    nom_cmd: "antidemote",
    react: "🛑",
    desc: "Active ou désactive l'antidémotion",
  },
];

commands.forEach(({ nom_cmd, react, desc }) => {
  ovlcmd(
    {
      nom_cmd,
      classe: "Groupe",
      react,
      desc,
    },
    async (jid, ovl, cmd_options) => {
      const { repondre, arg, verif_Groupe, verif_Admin } = cmd_options;

      try {
        if (!verif_Groupe) {
          return repondre("❌ Cette commande fonctionne uniquement dans les groupes.");
        }

        if (!verif_Admin) {
          return repondre("❌ Seuls les administrateurs peuvent utiliser cette commande.");
        }

        const sousCommande = arg[0]?.toLowerCase();
        const validModes = ["on", "off"];

        const [settings] = await GroupSettings.findOrCreate({
          where: { id: jid },
          defaults: { id: jid, [nom_cmd]: "non" },
        });

        if (validModes.includes(sousCommande)) {
          const newMode = sousCommande === "on" ? "oui" : "non";
          if (settings[nom_cmd] === newMode) {
            return repondre(`${nom_cmd} est déjà ${sousCommande}.`);
          }
          settings[nom_cmd] = newMode;
          await settings.save();
          return repondre(`${nom_cmd} ${sousCommande === "on" ? "activé" : "désactivé"} avec succès !`);
        }

        return repondre(`Utilisation :\n${nom_cmd} on/off : ${desc.toLowerCase()}.`);
      } catch (error) {
        console.error(`Erreur lors de la configuration de ${nom_cmd} :`, error);
        return repondre("❌ Une erreur s'est produite lors de l'exécution de la commande.");
      }
    }
  );
});

