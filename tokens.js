const uuid = require('node-uuid');


const Y_API = "Enter <Yandex Key>"

const H_KEY = '<Enter Hondify Key>';
const H_ID = 'Enter <Hondify Id>';
const H_U_ID = uuid.v1();

const R_KEY = 'Enter <Rev.AI Key>';


module.exports = {
  yandex: Y_API,

  houndify: {
    key: H_KEY,
    id: H_ID,
    uId: H_U_ID,
  },

  revAI: R_KEY,
};