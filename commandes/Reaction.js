const { ovlcmd } = require("../framework/ovlcmd");
const axios = require('axios');

const actions = {
    embeter: "https://api.waifu.pics/sfw/bully",
    caliner: "https://api.waifu.pics/sfw/cuddle",
    pleurer: "https://api.waifu.pics/sfw/cry",
    enlacer: "https://api.waifu.pics/sfw/hug",
    awoo: "https://api.waifu.pics/sfw/awoo",
    embrasser: "https://api.waifu.pics/sfw/kiss",
    lecher: "https://api.waifu.pics/sfw/lick",
    tapoter: "https://api.waifu.pics/sfw/pat",
    sourire_fier: "https://api.waifu.pics/sfw/smug",
    assommer: "https://api.waifu.pics/sfw/bonk",
    lancer: "https://api.waifu.pics/sfw/yeet",
    rougir: "https://api.waifu.pics/sfw/blush",
    sourire: "https://api.waifu.pics/sfw/smile",
    saluer: "https://api.waifu.pics/sfw/wave",
    highfive: "https://api.waifu.pics/sfw/highfive",
    tenir_main: "https://api.waifu.pics/sfw/handhold",
    croquer: "https://api.waifu.pics/sfw/nom",
    mordre: "https://api.waifu.pics/sfw/bite",
    sauter: "https://api.waifu.pics/sfw/glomp",
    gifler: "https://api.waifu.pics/sfw/slap",
    tuer: "https://api.waifu.pics/sfw/kill",
    coup_de_pied: "https://api.waifu.pics/sfw/kick",
    heureux: "https://api.waifu.pics/sfw/happy",
    clin_doeil: "https://api.waifu.pics/sfw/wink",
    pousser: "https://api.waifu.pics/sfw/poke",
    danser: "https://api.waifu.pics/sfw/dance",
    gene: "https://api.waifu.pics/sfw/cringe"
};

function getRandomGif(url) {
    return axios.get(url).then(response => {
        const gifs = response.data?.url;
        throw new Error("Aucun GIF trouvé.");
    });
}

function addReactionCommand(nom_cmd, reaction_url) {
    ovlcmd(
        {
            nom_cmd: nom_cmd,
            classe: "Réaction",
            react: "💬",
            desc: `Réaction de type ${nom_cmd}`
        },
        async (ms_org, ovl, cmd_options) => {
            const { arg, ms, auteur_Message, auteur_Msg_Repondu, repondre } = cmd_options;
             const cible = auteur_Msg_Repondu || (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@s.whatsapp.net`);

            let reactionCaption;
            if (cible) {
                switch (nom_cmd) {
                    case 'embeter':
                        reactionCaption = `@${auteur_Message} a embêté @${cible.split('@')[0]}`;
                        break;
                    case 'caliner':
                        reactionCaption = `@${auteur_Message} a câliné @${cible.split('@')[0]}`;
                        break;
                    case 'pleurer':
                        reactionCaption = `@${auteur_Message} a pleuré avec @${cible.split('@')[0]}`;
                        break;
                    case 'enlacer':
                        reactionCaption = `@${auteur_Message} a enlacé @${cible.split('@')[0]}`;
                        break;
                    case 'awoo':
                        reactionCaption = `@${auteur_Message} a fait "awoo" avec @${cible.split('@')[0]}`;
                        break;
                    case 'embrasser':
                        reactionCaption = `@${auteur_Message} a embrassé @${cible.split('@')[0]}`;
                        break;
                    case 'lecher':
                        reactionCaption = `@${auteur_Message} a léché @${cible.split('@')[0]}`;
                        break;
                    case 'tapoter':
                        reactionCaption = `@${auteur_Message} a tapoté @${cible.split('@')[0]}`;
                        break;
                    case 'sourire_fier':
                        reactionCaption = `@${auteur_Message} a souri avec fierté à @${cible.split('@')[0]}`;
                        break;
                    case 'assommer':
                        reactionCaption = `@${auteur_Message} a assommé @${cible.split('@')[0]}`;
                        break;
                    case 'lancer':
                        reactionCaption = `@${auteur_Message} a lancé @${cible.split('@')[0]}`;
                        break;
                    case 'rougir':
                        reactionCaption = `@${auteur_Message} a rougi en regardant @${cible.split('@')[0]}`;
                        break;
                    case 'sourire':
                        reactionCaption = `@${auteur_Message} a souri à @${cible.split('@')[0]}`;
                        break;
                    case 'saluer':
                        reactionCaption = `@${auteur_Message} a salué @${cible.split('@')[0]}`;
                        break;
                    case 'highfive':
                        reactionCaption = `@${auteur_Message} a fait un "high five" avec @${cible.split('@')[0]}`;
                        break;
                    case 'tenir_main':
                        reactionCaption = `@${auteur_Message} a tenu la main de @${cible.split('@')[0]}`;
                        break;
                    case 'croquer':
                        reactionCaption = `@${auteur_Message} a croqué @${cible.split('@')[0]}`;
                        break;
                    case 'mordre':
                        reactionCaption = `@${auteur_Message} a mordu @${cible.split('@')[0]}`;
                        break;
                    case 'sauter':
                        reactionCaption = `@${auteur_Message} a sauté sur @${cible.split('@')[0]}`;
                        break;
                    case 'gifler':
                        reactionCaption = `@${auteur_Message} a giflé @${cible.split('@')[0]}`;
                        break;
                    case 'tuer':
                        reactionCaption = `@${auteur_Message} a tué @${cible.split('@')[0]}`;
                        break;
                    case 'coup_de_pied':
                        reactionCaption = `@${auteur_Message} a donné un coup de pied à @${cible.split('@')[0]}`;
                        break;
                    case 'heureux':
                        reactionCaption = `@${auteur_Message} a partagé sa joie avec @${cible.split('@')[0]}`;
                        break;
                    case 'clin_doeil':
                        reactionCaption = `@${auteur_Message} a fait un clin d'œil à @${cible.split('@')[0]}`;
                        break;
                    case 'pousser':
                        reactionCaption = `@${auteur_Message} a poussé @${cible.split('@')[0]}`;
                        break;
                    case 'danser':
                        reactionCaption = `@${auteur_Message} a dansé avec @${cible.split('@')[0]}`;
                        break;
                    case 'gene':
                        reactionCaption = `@${auteur_Message} a ressenti de la gêne en voyant @${cible.split('@')[0]}`;
                        break;
                    default:
                        reactionCaption = `@${auteur_Message} a réagi à @${cible.split('@')[0]}`;
                }
            } else {
                switch (action) {
                    case 'embeter': 
                        reactionCaption = `@${auteur_Message} a embêté tout le monde.`;
                        break;
                    case 'caliner':
                        reactionCaption = `@${auteur_Message} a envoyé un câlin chaleureux.`;
                        break;
                    case 'pleurer':
                        reactionCaption = `@${auteur_Message} a partagé sa tristesse.`;
                        break;
                    case 'enlacer':
                        reactionCaption = `@${auteur_Message} a voulu serrer quelqu'un dans ses bras.`;
                        break;
                    case 'awoo':
                        reactionCaption = `@${auteur_Message} a crié "awoo" pour tout le monde.`;
                        break;
                    case 'embrasser':
                        reactionCaption = `@${auteur_Message} a envoyé un bisou à tout le monde.`;
                        break;
                    case 'lecher':
                        reactionCaption = `@${auteur_Message} a décidé de lécher dans le vide.`;
                        break;
                    case 'tapoter':
                        reactionCaption = `@${auteur_Message} a donné des petites tapes imaginaires.`;
                        break;
                    case 'sourire_fier':
                        reactionCaption = `@${auteur_Message} affiche un sourire fier.`;
                        break;
                    case 'assommer':
                        reactionCaption = `@${auteur_Message} a voulu assommer quelqu'un.`;
                        break;
                    case 'lancer':
                        reactionCaption = `@${auteur_Message} a lancé quelque chose au hasard.`;
                        break;
                    case 'rougir':
                        reactionCaption = `@${auteur_Message} rougit de gêne.`;
                        break;
                    case 'sourire':
                        reactionCaption = `@${auteur_Message} sourit à tout le monde.`;
                        break;
                    case 'saluer':
                        reactionCaption = `@${auteur_Message} a salué tout le monde.`;
                        break;
                    case 'highfive':
                        reactionCaption = `@${auteur_Message} a fait un high five dans le vide.`;
                        break;
                    case 'tenir_main':
                        reactionCaption = `@${auteur_Message} a tendu la main.`;
                        break;
                    case 'croquer':
                        reactionCaption = `@${auteur_Message} a fait semblant de croquer dans le vide.`;
                        break;
                    case 'mordre':
                        reactionCaption = `@${auteur_Message} a essayé de mordre quelqu'un d'invisible.`;
                        break;
                    case 'sauter':
                        reactionCaption = `@${auteur_Message} a sauté partout.`;
                        break;
                    case 'gifler':
                        reactionCaption = `@${auteur_Message} a giflé dans le vent.`;
                        break;
                    case 'tuer':
                        reactionCaption = `@${auteur_Message} a voulu tuer le silence.`;
                        break;
                    case 'coup_de_pied':
                        reactionCaption = `@${auteur_Message} a donné un coup de pied dans l'air.`;
                        break;
                    case 'heureux':
                        reactionCaption = `@${auteur_Message} est tout simplement heureux.`;
                        break;
                    case 'clin_doeil':
                        reactionCaption = `@${auteur_Message} a fait un clin d'œil à tout le monde.`;
                        break;
                    case 'pousser':
                        reactionCaption = `@${auteur_Message} a poussé dans le vide.`;
                        break;
                    case 'danser':
                        reactionCaption = `@${auteur_Message} a commencé à danser.`;
                        break;
                    case 'gene':
                        reactionCaption = `@${auteur_Message} ressent une gêne inexplicable.`;
                        break;
                    default:
                        reactionCaption = `@${auteur_Message} a réagi avec une action indéfinie.`;
                }
            }

            try {
                const gifUrl = await getRandomGif(actions[nom_cmd] || "https://api.waifu.pics/many/sfw/smile");
                await ovl.sendMessage(ms_org, { video: gifUrl, gifPlayback: true, mentions: [cible, auteur_Message], caption: reactionCaption }, { quoted: ms });
            } catch (error) {
                console.error(error);
                await repondre("Désolé, je n'ai pas pu trouver de GIF pour cette action.");
            }
        }
    );
}

Object.entries(actions).forEach(([action, url]) => {
    addReactionCommand(action, url);
});
