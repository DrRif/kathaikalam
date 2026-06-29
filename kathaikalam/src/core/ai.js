const AI_SYSTEM = `You are a world-building AI for Kathai Kalam.
Given a prompt, return ONLY a JSON object (no markdown, no backticks, no explanation):
{
  "name": "evocative world name, 2-4 words",
  "era": "time period string",
  "tagline": "one poetic sentence",
  "eraStyle": "ancient or medieval or fantasy or feudal or viking or scifi or apocalypse",
  "biome": "coastal or highland or forest or desert or arctic",
  "time": "dawn or dusk or noon or night",
  "tone": "Epic or Dark or Mysterious or Sacred or Tense or Desolate"
}

Rules:
- Tamil / Indian ancient civilisation → ancient + coastal or highland
- Medieval Europe → medieval + highland or forest
- Japanese feudal → feudal + forest or highland
- Norse / Viking → viking + coastal or arctic
- Fantasy → fantasy + any biome
- Science fiction / space → scifi + any (treat as futuristic version of biome)
- Post-apocalypse → apocalypse + desert or highland

Make every world feel unique and specific to the prompt.`

export async function generateWorldFromPrompt(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: AI_SYSTEM,
      messages: [{ role: 'user', content: `Create a world for: "${prompt}"` }]
    })
  })

  const data = await response.json()
  if (data.error) throw new Error(data.error.message)

  let raw = data.content[0].text.trim()
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  return JSON.parse(raw)
}

export const SURPRISE_PROMPTS = [
  'Tamil coastal kingdom 300 BCE. Warrior queen. Monsoon. Sea spies. Betrayal in the royal court.',
  'Medieval castle town 1200 CE. Cathedral under construction. Black plague rumours. A tournament announced.',
  'Japanese feudal village 1500 CE. Samurai lord growing old. Tea ceremony. A ronin arrives at dusk.',
  'Viking Norse coastal settlement 900 CE. Longhouses. A longship returns. Winter is coming. Gods are watching.',
  'Fantasy elvish forest city in ancient treetops. Crystal spires. War approaching from the dark kingdom.',
  'Deep space colony 2387 CE. Metallic domes. Reactor failing. 12,000 survivors. The AI has gone quiet.',
  'Post-apocalyptic survivor camp year 47. Scavenged shelters. Crops failing. Raiders seen on the ridge.',
  '1924 noir port city. Corrupt police chief. Jazz club. A body found in the harbour. Everyone has a secret.',
  'Ancient Egyptian delta 1350 BCE. Pharaoh building a secret tomb. River flooding. A conspiracy forming.',
  `Mongolian steppe 1220 CE. A Khan's winter camp. Scouts report a walled city ahead. Ten days until attack.`,
]
