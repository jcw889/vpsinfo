/**
 * @name 试听接口
 * @description 最后的选择...
 * @version 1.0.0
 * @author Folltoshe
 * @homepage https://github.com/Folltoshe
 */

const { EVENT_NAMES, on, send, request, utils: lxUtils, version } = window.lx;

const md5 = str => utils.crypto.md5(str);

const httpRequest = (url, options) =>
  new Promise((resolve, reject) => {
    request(url, options, (err, resp) => {
      if (err) return reject(err);
      resolve(resp.body);
    });
  });

const utils = {
  buffer: {
    from: lxUtils.buffer.from,
    bufToString: lxUtils.buffer.bufToString,
  },
  crypto: {
    aesEncrypt: lxUtils.crypto.aesEncrypt,
    md5: lxUtils.crypto.md5,
    randomBytes: lxUtils.crypto.randomBytes,
    rsaEncrypt: lxUtils.crypto.rsaEncrypt,
  },
};

const kw = {
  info: {
    name: "酷我音乐",
    type: "music",
    actions: ["musicUrl"],
    qualitys: ["128k"],
  },

  musicUrl({ songmid }, quality) {
    // console.log(songmid, quality)
    const target_url = `http://www.kuwo.cn/api/v1/www/music/playUrl?mid=${songmid}&type=music&httpsStatus=1`;

    return httpRequest(target_url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0",
        Referer: "http://kuwo.cn/",
      },
    }).then(body => {
      //   console.log(body);
      if (body.code != 200) return Promise.reject(new Error("Failed"));
      return Promise.resolve(body.data.url);
    });
  },
};

// https://github.com/helloplhm-qwq/sth/blob/main/lxmusic-plhm-source.js
const kg = {
  info: {
    name: "酷狗音乐",
    type: "music",
    actions: ["musicUrl"],
    qualitys: ["128k"],
  },

  musicUrl({ hash, albumId }, quality) {
    let key = md5(hash.toLowerCase() + "kgcloudv2100500");
    let target_url = `http://trackercdn.kugou.com/i/v2/?cmd=26&key=${key}&hash=${hash.toLowerCase()}&pid=1&behavior=play&mid=0&appid=1005&userid=0&version=8876&vipType=0&token=0`;
    return httpRequest(target_url, {
      method: "GET",
    }).then(body => {
      //   console.log(body);
      if (body.status != 1) return Promise.reject(new Error("Failed"));
      return Promise.resolve(body.url[0]);
    });
  },
};

const fileConfig = {
  "128k": {
    s: "M500",
    e: ".mp3",
    bitrate: "128kbps",
  },
  "320k": {
    s: "M800",
    e: ".mp3",
    bitrate: "320kbps",
  },
  flac: {
    s: "F000",
    e: ".flac",
    bitrate: "FLAC",
  },
};

const tx = {
  info: {
    name: "企鹅音乐",
    type: "music",
    actions: ["musicUrl"],
    qualitys: ["128k"],
  },

  musicUrl({ songmid }, quality) {
    const target_url = "https://u.y.qq.com/cgi-bin/musicu.fcg";
    const guid = "10000";
    const songmidList = [songmid];
    const uin = "0";

    const fileInfo = fileConfig[quality];
    const file =
      songmidList.length === 1 &&
      `${fileInfo.s}${songmid}${songmid}${fileInfo.e}`;

    const reqData = {
      req_0: {
        module: "vkey.GetVkeyServer",
        method: "CgiGetVkey",
        param: {
          filename: file ? [file] : [],
          guid,
          songmid: songmidList,
          songtype: [0],
          uin,
          loginflag: 1,
          platform: "20",
        },
      },
      loginUin: uin,
      comm: {
        uin,
        format: "json",
        ct: 24,
        cv: 0,
      },
    };
    return httpRequest(
      `${target_url}?format=json&data=${JSON.stringify(reqData)}`,
      {
        method: "GET",
        headers: {
          channel: "0146951",
          uid: 1234,
        },
      }
    ).then(body => {
      //   console.log(body);
      const { purl } = body.req_0.data.midurlinfo[0];
      if (purl === "") return Promise.reject(new Error("Failed"));
      return Promise.resolve(body.req_0.data.sip[0] + purl);
    });
  },
};

const buf2hex = buffer => {
  return version
    ? utils.buffer.bufToString(buffer, "hex")
    : [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, "0"))
        .join("");
};

const aesEncrypt = (data, eapiKey, iv, mode) => {
  if (!version) {
    mode = mode.split("-").pop();
  }
  return utils.crypto.aesEncrypt(data, mode, eapiKey, iv);
};

const qualitys = {
  "128k": 128000,
  "320k": 320000,
  flac: 999000,
};
const eapi = async (url, object) => {
  const eapiKey = "e82ckenh8dichen8";

  const text = typeof object === "object" ? JSON.stringify(object) : object;
  const message = `nobody${url}use${text}md5forencrypt`;
  const digest = md5(message);
  const data = `${url}-36cd479b6b5-${text}-36cd479b6b5-${digest}`;
  return {
    params: buf2hex(aesEncrypt(data, eapiKey, "", "aes-128-ecb")).toUpperCase(),
  };
};

let cookie = "os=pc";

const wy = {
  info: {
    name: "网易音乐",
    type: "music",
    actions: ["musicUrl"],
    qualitys: ["128k"],
  },

  async musicUrl({ songmid }, quality) {
    const newQuality = qualitys[quality];
    const target_url =
      "https://interface3.music.163.com/eapi/song/enhance/player/url";
    const eapiUrl = "/api/song/enhance/player/url";
    const d = {
      ids: `[${songmid}]`,
      br: newQuality,
    };
    const data = await eapi(eapiUrl, d);

    return new Promise((resolve, reject) => {
      request(
        target_url,
        {
          method: "POST",
          form: data,
          headers: {
            cookie,
          },
        },
        (err, res) => {
          if (err) return reject(err);
          //   console.log(res.headers, res.body);
          if (!res.headers.cookie) cookie = res.headers.cookie;
          const { url } = res.body.data[0];
          if (!url) return reject(new Error("Failed."));
          return resolve(url);
        }
      );
    });
  },
};

const mg_qualitys = {
  "128k": "1",
  "320k": "2",
  flac: "3",
  flac24bit: "4",
};

const mg = {
  info: {
    name: "咪咕音乐",
    type: "music",
    actions: ["musicUrl"],
    qualitys: ["128k", "320k", "flac", "flac24bit"],
  },

  musicUrl({ songmid }, quality) {
    quality = mg_qualitys[quality];
    const target_url = `https://api.dog886.com/v1/getMiGuSong?id=${songmid}&type=${quality}`;
    return httpRequest(target_url, {
      method: "GET",
    }).then(body => {
      //   console.log(body);
      if (!body.data.url) return Promise.reject(new Error("Failed."));
      return Promise.resolve(`https:${body.data.url}`);
    });
  },
};

const apis = {
  kw: kw,
  kg: kg,
  tx: tx,
  wy: wy,
  mg: mg,
};

on(EVENT_NAMES.request, ({ source, action, info }) => {
  switch (action) {
    case "musicUrl":
      return apis[source].musicUrl(info.musicInfo, info.type).catch(err => {
        // console.log(err.message)
        return Promise.reject(err);
      });
  }
});

const sources = {};
for (const [source, apiInfo] of Object.entries(apis)) {
  sources[source] = apiInfo.info;
}

send(EVENT_NAMES.inited, {
  status: true,
  openDevTools: false,
  sources,
});
