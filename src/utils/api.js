import axios from "axios";

let api = axios.create({
   //baseURL: 'http://localhost:1234',
  baseURL: "https://tic-estoque-v2.vercel.app/",
  timeout: 10000,
});

export { api };
