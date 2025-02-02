const { ovlcmd, cmd } = require("../framework/ovlcmd");
const axios = require('axios');
const gis = require("g-i-s");
const wiki = require('wikipedia');
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const config = require('../set');

ovlcmd(
    {
        nom_cmd: "img",
        classe: "search",
        react: "🔍",
        desc: "Recherche d'images"
    },
    async (ms_org, ovl, cmd_options) => {
      const { arg } = cmd_options;
        const searchTerm = arg.join(" ");
        if (!searchTerm) {
            return ovl.sendMessage(ms_org, { text: "Veuillez fournir un terme de recherche, par exemple : img ovl-Md" });
        }

        gis(searchTerm, async (error, results) => {
            if (error) {
                console.error("Erreur lors de la recherche d'images:", error);
                return ovl.sendMessage(ms_org, { text: "Erreur lors de la recherche d'images." });
            }

            const images = results.slice(0, 5);
            if (images.length === 0) {
                return ovl.sendMessage(ms_org, { text: "Aucune image trouvée pour ce terme de recherche." });
            }

            for (const image of images) {
                try {
                    await ovl.sendMessage(ms_org, {
                        image: { url: image.url },
                        caption: `\`\`\`Powered By OVL-MD\`\`\``
                    });
                } catch (err) {
                    console.error("Erreur lors de l'envoi de l'image:", err);
                }
            }
        });
    }
);



/*
ovlcmd(
    {
        nom_cmd: "horo",
        classe: "search",
        react: "♈",
        desc: "Donne les informations sur l'horoscope du jour."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg } = cmd_options;
        const signeFr = arg.join(" ").toLowerCase();
        
        // Mappage des signes français vers les signes anglais
        const signesMap = {
            "bélier": "aries",
            "taureau": "taurus",
            "gémeaux": "gemini",
            "cancer": "cancer",
            "lion": "leo",
            "vierge": "virgo",
            "balance": "libra",
            "scorpion": "scorpio",
            "sagittaire": "sagittarius",
            "capricorne": "capricorn",
            "verseau": "aquarius",
            "poissons": "pisces"
        };

        if (!signesMap[signeFr]) {
            return ovl.sendMessage(ms_org, { text: "Signe invalide. Veuillez utiliser un signe valide (ex: Bélier, Taureau, etc.)." });
        }

        const signeEn = signesMap[signeFr];

        try {
            const URL = `https://aztro.sameerkumar.website/?sign=${signeEn}&day=today`;
            
            // Utilisation de axios pour faire la requête HTTP
            const response = await axios.post(URL);

            if (response.status === 200) {
                const json = response.data;
                let textw = "";
                
                // Construction du message avec traduction des données
                textw += `*🌟 Horoscope du jour pour ${signeFr.charAt(0).toUpperCase() + signeFr.slice(1)}*\n\n`;
                textw += `*Date actuelle :* ${json.current_date}.\n`;
                textw += `*Signe :* ${signeFr.charAt(0).toUpperCase() + signeFr.slice(1)}.\n`;
                textw += `*Heure chanceuse :* ${json.lucky_time.trim()}.\n`;
                textw += `*Compatibilité :* ${json.compatibility.trim()}.\n`;
                textw += `*Numéro chanceux :* ${json.lucky_number.trim()}.\n`;
                textw += `*Couleur chanceuse :* ${json.color.trim()}.\n`;
                textw += `*Humeur du jour :* ${json.mood.trim()}.\n`;
                textw += `*Résumé :* ${json.description.trim()}.\n`;

                // Envoi du message
                ovl.sendMessage(ms_org, { text: textw });
            } else {
                ovl.sendMessage(ms_org, { text: "Une erreur s'est produite lors de la récupération de l'horoscope." });
            }
        } catch (e) {
            console.log(e);
            ovl.sendMessage(ms_org, { text: "Une erreur s'est produite." });
        }
    }
);*/

ovlcmd(
    {
        nom_cmd: "lyrics",
        classe: "search",
        react: "🎵",
        desc: "Cherche les paroles d'une chanson"
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg } = cmd_options;
        const songName = arg.join(" ");
        if (!songName) {
            return ovl.sendMessage(ms_org, { text: "❗ Veuillez fournir un nom de chanson pour obtenir les paroles." });
        }

        try {
            const apiUrl = `https://api.dreaded.site/api/lyrics?title=${encodeURIComponent(songName)}`;
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (!data || !data.result || !data.result.lyrics) {
                return ovl.sendMessage(ms_org, { text: "❗ Désolé, je n'ai pas trouvé les paroles pour cette chanson." });
            }

            const { title, artist, lyrics, thumb } = data.result;
            const message = `*🎵Titre :* ${title}\n*🎤Artiste :* ${artist}\n\n*🎶Paroles :*\n${lyrics}`;

            if (thumb) {
                await ovl.sendMessage(ms_org, { image: { url: thumb }, caption: message });
            } else {
                await ovl.sendMessage(ms_org, { text: message });
            }
        } catch (error) {
            console.error("Erreur lors de la recherche des paroles :", error.message);
            ovl.sendMessage(ms_org, { text: "❗ Une erreur s'est produite lors de la recherche des paroles." });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "google",
        classe: "search",
        desc: "Recherche sur Google.",
        alias: ["search"],
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg } = cmd_options;
        if (!arg[0]) {
            return await ovl.sendMessage(ms_org, { text: "❗ Entrez un terme à rechercher sur Google." });
        }

        const searchTerm = arg.join(" ");
        try {
            const response = await axios.get(
                `https://www.googleapis.com/customsearch/v1`,
                {
                    params: {
                        q: searchTerm,
                        key: "AIzaSyDMbI3nvmQUrfjoCJYLS69Lej1hSXQjnWI",
                        cx: "baf9bdb0c631236e5",
                    },
                }
            );

            if (!response.data.items || response.data.items.length === 0) {
                return await ovl.sendMessage(ms_org, {
                    text: "❗ Aucun résultat trouvé pour cette recherche.",
                });
            }

            const results = response.data.items.slice(0, 3); // Limiter à 3 résultats

            let searchResultsMsg = `*🔍 Résultats de recherche pour : ${searchTerm}*\n\n`;
            results.forEach((result, index) => {
                searchResultsMsg += `${index + 1}. *📌Titre:* ${result.title}\n*📃Description:* ${result.snippet}\n*🌐Lien:* ${result.link}\n\n`;
            });

            await ovl.sendMessage(ms_org, { text: searchResultsMsg });
        } catch (error) {
            console.error("Erreur dans la recherche Google :", error);
            await ovl.sendMessage(ms_org, {
                text: "❗ Une erreur est survenue lors de la recherche sur Google. Veuillez réessayer.",
            });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "wiki",
        classe: "search",
        react: "📖",
        desc: "Recherche sur Wikipédia.",
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg } = cmd_options;
        if (!arg[0]) {
            return await ovl.sendMessage(ms_org, { text: "❗ Entrez un terme à rechercher sur Wikipédia." });
        }

        const searchTerm = arg.join(" ");
        try {
            const con = await wiki.summary(searchTerm);

            const mess = `*📖Wikipédia :*\n\n*📌Titre:* ${con.title}\n\n*📃Description:* ${con.description}\n\n*📄Résumé:* ${con.extract}\n\n*🌐Lien:* ${con.content_urls.mobile.page}`;

            await ovl.sendMessage(ms_org, { text: mess });
        } catch (error) {
            console.error("Erreur dans la recherche Wikipédia :", error);
            await ovl.sendMessage(ms_org, {
                text: "❗ Une erreur est survenue lors de la recherche sur Wikipédia. Veuillez réessayer.",
            });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "github",
        classe: "search",
        react: "🔍",
        desc: "Récupère les informations d'un utilisateur GitHub"
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg } = cmd_options;
        const username = arg.join(" ");

        if (!username) {
            return ovl.sendMessage(ms_org, { text: "❗ Veuillez fournir un nom d'utilisateur GitHub à rechercher." });
        }

        try {
            const response = await axios.get(`https://api.github.com/users/${encodeURIComponent(username)}`);
            const data = response.data;

            const message = `*👤 Nom d'utilisateur :* ${data.login}\n`
                + `*📛 Nom affiché :* ${data.name || "Non spécifié"}\n`
                + `*📝 Bio :* ${data.bio || "Aucune bio"}\n`
                + `*🏢 Entreprise :* ${data.company || "Non spécifiée"}\n`
                + `*📍 Localisation :* ${data.location || "Non spécifiée"}\n`
                + `*🔗 Lien :* ${data.html_url}\n`
                + `*👥 Followers :* ${data.followers}\n`
                + `*👤 Following :* ${data.following}\n`
                + `*📦 Repos publics :* ${data.public_repos}\n`
                + `*🕰️ Créé le :* ${data.created_at.split("T")[0]}`;

            if (data.avatar_url) {
                await ovl.sendMessage(ms_org, { image: { url: data.avatar_url }, caption: message });
            } else {
                await ovl.sendMessage(ms_org, { text: message });
            }

        } catch (error) {
            console.error("Erreur lors de la récupération des données GitHub :", error.message);
            ovl.sendMessage(ms_org, { text: "❗ Impossible de récupérer les données GitHub.\n" + error.message });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "imdb",
        classe: "search",
        react: "🎬",
        desc: "Recherche des informations sur un film ou une série via IMDB"
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg } = cmd_options;
        const movieName = arg.join(" ");

        if (!movieName) {
            return ovl.sendMessage(ms_org, { text: "❗ Veuillez fournir un nom de film ou de série à rechercher." });
        }

        try {
            const response = await axios.get(`http://www.omdbapi.com/?apikey=742b2d09&t=${encodeURIComponent(movieName)}&plot=full`);
            const data = response.data;

            if (data.Response === "False") {
                return ovl.sendMessage(ms_org, { text: "❗ Impossible de trouver ce film ou cette série." });
            }

            const imdbInfo = `⚍⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚍\n`
                + `🎬 *IMDB MOVIE SEARCH*\n`
                + `⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎\n`
                + `*🎞️ Titre :* ${data.Title}\n`
                + `*📅 Année :* ${data.Year}\n`
                + `*⭐ Classement :* ${data.Rated}\n`
                + `*📆 Sortie :* ${data.Released}\n`
                + `*⏳ Durée :* ${data.Runtime}\n`
                + `*🌀 Genre :* ${data.Genre}\n`
                + `*👨🏻‍💻 Réalisateur :* ${data.Director}\n`
                + `*✍ Scénariste :* ${data.Writer}\n`
                + `*👨 Acteurs :* ${data.Actors}\n`
                + `*📃 Synopsis :* ${data.Plot}\n`
                + `*🌐 Langue :* ${data.Language}\n`
                + `*🌍 Pays :* ${data.Country}\n`
                + `*🎖️ Récompenses :* ${data.Awards || "Aucune"}\n`
                + `*📦 Box-office :* ${data.BoxOffice || "Non disponible"}\n`
                + `*🏙️ Production :* ${data.Production || "Non spécifiée"}\n`
                + `*🌟 Note IMDb :* ${data.imdbRating} ⭐\n`
                + `*❎ Votes IMDb :* ${data.imdbVotes}`;

            if (data.Poster && data.Poster !== "N/A") {
                await ovl.sendMessage(ms_org, { image: { url: data.Poster }, caption: imdbInfo });
            } else {
                await ovl.sendMessage(ms_org, { text: imdbInfo });
            }

        } catch (error) {
            console.error("Erreur lors de la récupération des données IMDB :", error.message);
            ovl.sendMessage(ms_org, { text: "❗ Une erreur s'est produite lors de la recherche du film.\n" + error.message });
        }
    }
);

ovlcmd(
  {
    nom_cmd: "stickersearch",
    classe: "fun",
    react: "🖼️",
    desc: "Recherche et envoie des stickers animés basés sur un mot-clé.",
    alias: ["sstick"]
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, auteur_Message } = cmd_options;
    
    if (!arg.length) {
      return ovl.sendMessage(ms_org, { text: "Veuillez fournir un terme de recherche pour le sticker !" });
    }

    if (cmd_options.verif_Groupe) {
      ovl.sendMessage(ms_org, { text: "Pour éviter le spam, les stickers seront envoyés en privé. 📥" });
    }

    const tenorApiKey = "AIzaSyCyouca1_KKy4W_MG1xsPzuku5oa8W358c";
    const searchTerm = encodeURIComponent(arg.join(" "));

    try {
      const response = await axios.get(
        `https://tenor.googleapis.com/v2/search?q=${searchTerm}&key=${tenorApiKey}&client_key=my_project&limit=8&media_filter=gif`
      );
      
      const stickers = response.data.results;
      if (!stickers.length) {
        return ovl.sendMessage(ms_org, { text: "Aucun sticker trouvé pour cette recherche." });
      }

      for (let i = 0; i < Math.min(8, stickers.length); i++) {
        const gifUrl = stickers[i].media_formats.gif.url;
        const sticker = new Sticker(gifUrl, {
          pack: config.STICKER_PACK_NAME,
          author: config.STICKER_AUTHOR_NAME,
          type: StickerTypes.FULL,
          categories: ["🤩", "🎉"],
          id: "12345",
          quality: 60,
          background: "transparent",
        });

        const stickerBuffer = await sticker.toBuffer();
        await ovl.sendMessage(auteur_Message, { sticker: stickerBuffer });
      }
    } catch (error) {
      console.error(error);
      ovl.sendMessage(ms_org, { text: "Une erreur s'est produite lors de la récupération des stickers." });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "meteo",
    classe: "search",
    react: "🌦️",
    desc: "Affiche la météo d'une ville.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg } = cmd_options;
    const cityName = arg.join(" ");

    if (!cityName) {
      return ovl.sendMessage(ms_org, { text: "❗ Veuillez fournir un nom de ville." });
    }

    try {
      const apiKey = "1ad47ec6172f19dfaf89eb3307f74785";
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${apiKey}`;

      const response = await axios.get(url);
      const data = response.data;

      const city = data.name;
      const country = data.sys.country;
      const temperature = data.main.temp;
      const feelsLike = data.main.feels_like;
      const minTemperature = data.main.temp_min;
      const maxTemperature = data.main.temp_max;
      const description = data.weather[0].description;
      const humidity = data.main.humidity;
      const windSpeed = data.wind.speed;
      const rainVolume = data.rain ? data.rain["1h"] || 0 : 0;
      const cloudiness = data.clouds.all;
      const sunrise = new Date(data.sys.sunrise * 1000);
      const sunset = new Date(data.sys.sunset * 1000);

      // Formatage des heures de lever et coucher du soleil (juste h:min:s)
      const formatTime = (date) => {
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const seconds = date.getUTCSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
      };

      const formattedSunrise = formatTime(sunrise);
      const formattedSunset = formatTime(sunset);

      const weatherMessage = `🌍 *Météo à ${city}, ${country}*  

🌡️ *Température :* ${temperature}°C  
🌡️ *Ressenti :* ${feelsLike}°C  
📉 *Température min :* ${minTemperature}°C  
📈 *Température max :* ${maxTemperature}°C  
📝 *Description :* ${description.charAt(0).toUpperCase() + description.slice(1)}  
💧 *Humidité :* ${humidity}%  
💨 *Vent :* ${windSpeed} m/s  
🌧️ *Précipitations (1h) :* ${rainVolume} mm  
☁️ *Nébulosité :* ${cloudiness}%  
🌄 *Lever du soleil (GMT) :* ${formattedSunrise}  
🌅 *Coucher du soleil (GMT) :* ${formattedSunset}`;

      await ovl.sendMessage(ms_org, { text: weatherMessage });
    } catch (error) {
      console.error("Erreur lors de la récupération des données météo :", error.message);
      await ovl.sendMessage(ms_org, { text: "❗ Impossible de trouver cette ville. Vérifiez l'orthographe et réessayez !" });
    }
  }
);

