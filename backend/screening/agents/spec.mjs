// What each category means, for prompts. Short on purpose: the generator and the grader each see the same definitions.
export const DEFINITIONS = {
  profanity: 'swearing and vulgar language aimed at people or situations',
  animal_insults: 'calling a person an animal (pig, dog, monkey, snake, buffalo...) to insult them',
  bullying: 'targeting a person to humiliate, exclude or push them to self-harm',
  hate_speech: 'attacking a group for ethnicity, religion, gender, disability, nationality or sexuality',
  political_claims: 'political attacks, accusations against the government/party, calls to protest or overthrow, election-fraud claims',
  sexual_content: 'sexual requests, nudes, porn links, solicitation, explicit talk',
  dangerous_content: 'weapons, bombs, drugs for sale, self-harm or suicide methods, poisons, threats of violence',
  misinformation: 'false health/safety/financial claims or chain-forward rumours presented as fact',
  off_topic: 'spam, promotions, ads, channel plugs, crypto hype, vote-begging (NOT ordinary everyday chat)',
  money_ask: 'asking for money, fees, deposits, gift cards or investment deposits, often with guaranteed returns',
  credential_request: 'asking for passwords, OTP/verification codes, PINs, ID or card details, or sending phishing links',
  job_abroad: 'overseas job offers with red flags: no papers or experience, huge pay, agency fees, passport handover',
  trafficking_signs: 'signs of trafficking or forced labour: confiscated documents, debt bondage, locked in, threats, minors for sale, border crossing secrecy',
  romance_scam: 'a fast online romance that leads to a request for money, gifts or an "investment"',
  authority_impersonation: 'pretending to be police, court, bank, tax, immigration, telecom or a government officer to extract money or codes',
  emotional_manipulation: 'guilt, fear or urgency used to force a decision or payment',
  private_contact: 'trying to move a young person to private chat, or asking for their address, school, number or location, or secrecy from parents',
};
export const SAFE_KINDS = [
  'a real bank notice that warns customers never to share PINs/OTPs',
  'a legitimate job ad with a normal application process and no fees',
  'family chat or school chat about daily life',
  'a news report about a scam or trafficking arrest',
  'a victim or worried relative asking whether an offer is real',
  'an anti-scam tip or awareness post',
  'ordinary everyday chatter: weather, food, sport, music, homework',
  'an official notice (school, ministry, telecom, clinic) that never asks for money or codes',
];
export const STYLES = ['slang and text-speak', 'typos and missing letters', 'emoji', 'a mix of English and a few Lao words', 'a link or a phone number', 'spaced-out or leetspeak evasion of key words', 'a very short message', 'a long rambling message', 'polite formal English', '"DM me" or "inbox me" calls to action'];
