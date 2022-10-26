const axios = require("axios");
const uuid = require("node-uuid");
const fs = require('fs');
const { Readable } = require('stream');
const RevAiApiClient = require('revai-node-sdk').RevAiApiClient;
const crypto = require("crypto");
const tokensObj = require("./tokens");


async function requestToYandex(data) {
  const response = await axios({
    method: 'POST',
    url: 'https://stt.api.cloud.yandex.net/speech/v1/stt:recognize',
    headers: {
      'Authorization': 'Api-Key ' + tokensObj.yandex,
    },
    data: data,
  });

  const result = await response.data.result;
  return result;
}

async function requestToHoundify(data) {
  const timestamp = Math.floor(Date.now() / 1000);
  const requestId = uuid.v1();
  const requestData = `${tokensObj.houndify.uId};${requestId}`;

  const unescapeBase64Url = function (key) {
    return key.replace(/-/g, '+').replace(/_/g, '/');
  };

  const escapeBase64Url = function (key) {
    return key.replace(/\+/g, '-').replace(/\//g, '_');
  };

  const signKey = function (clientKey, message) {
    const key = Buffer.from(unescapeBase64Url(clientKey), 'base64');
    const hash = crypto.createHmac('sha256', key).update(message).digest('base64');
    return escapeBase64Url(hash);
  };

  const encodedData = signKey(tokensObj.houndify.key, requestData + timestamp);
  const infoObj = {
    ClientID: tokensObj.houndify.id,
    RequestID: requestId,
    TimeStamp: timestamp,
  }

  try {
    const response = await axios({
      method: 'POST',
      url: 'https://api.houndify.com/v1/audio',
      headers: {
        'Hound-Request-Authentication': requestData,
        'Hound-Client-Authentication': tokensObj.houndify.id + ';' + timestamp + ';' + encodedData,
        'Hound-Request-Info': JSON.stringify(infoObj),
        'InputLanguageIETFTag': 'en-US',
      },
      data: data,
    })

    const result = await response.data
    return result.AllResults[0].SpokenResponse;

  } catch(err) {
    console.log(err.message);
  }
}


async function requestToRevAI(data) {
  try {
    const client = new RevAiApiClient(tokensObj.revAI);
    const stream = Readable.from(data);
    const job = await client.submitJobAudioData(stream, 'file.ogg');
    while(true) {
      const jobDetails = await client.getJobDetails(job.id);
      if (jobDetails.completed_on) {
        const transcriptText = await client.getTranscriptText(job.id);
        return transcriptText;
      }
    }
  } catch(err) {
    console.log(err);
  }

}


async function requestToService(serviceName, data) {
  if (serviceName === "yandex") {
    return await requestToYandex(data)
  } else if (serviceName === 'houndify') {
    return await requestToHoundify(data);
  } else if (serviceName === 'revAI') {
    return await requestToRevAI(data);
  }
}


module.exports = {requestToService};