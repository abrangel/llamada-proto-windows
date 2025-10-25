const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

app.post('/ask', async (req, res) => {
  const { question, apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).send({ error: 'API key is required' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro'});
    const result = await model.generateContent(question);
    const response = await result.response;
    const text = response.text();
    res.send({ response: text });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Failed to get response from Gemini API' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
