import { SmartAppBrainRecognizer } from '@salutejs/recognizer-smartapp-brain'
import {
    createIntents,
    createMatchers,
    createSaluteRequest,
    createSaluteResponse,
    createScenarioWalker,
    createSystemScenario,
    createUserScenario,
    NLPRequest,
    NLPResponse,
    SaluteRequest
} from '@salutejs/scenario'
import { SaluteMemoryStorage } from '@salutejs/storage-adapter-memory'
import { dealHandler, helloHandler, noMatchHandler, runAppHandler, thanksHandler } from './handlers'
import model from './intents.json'
import { closeApp } from './utils/utils'
require('dotenv').config()

// const serviceAccount = require("./serviceAccountKey.json");
// // import serviceAccount from './serviceAccountKey.json'

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: 'https://my-good-deals-chat-sber-default-rtdb.europe-west1.firebasedatabase.app/'
//   });

// const storage2 = new SaluteFirebaseSessionStorage(admin.database())
const storage = new SaluteMemoryStorage()
const intents = createIntents(model.intents)
const { text, intent } = createMatchers<SaluteRequest, typeof intents>()

const userScenario = createUserScenario({
    Hello: {
        match: text('привет'),
        handle: helloHandler,
        children: {
            Yes: {
                match: intent('/Да', {confidence: 0.2}),
                handle: ({req, res}, dispatch) => {
                    console.log('yes handler')
                    dispatch && dispatch(['GetDeal'])
                }
            },
            No: {
                match: intent('/Нет', {confidence: 0.2}),
                handle: ({res}) => {
                    res.appendBubble('Тогда до встречи')
                    res.setPronounceText('Тогда до встречи')
                    res.finish()
                    closeApp(res.message)
                }
            }
        }
    },
    GetDeal: {
        match: req => {
            // console.log(req.inference?.variants)
            return intent('/Получить дело', {confidence: 0.4})(req)
        },
        handle: dealHandler
    },
    Thanks: {
        match: req => {
            return req.message.original_text.toLowerCase().includes('спасибо') || req.message.original_text.toLowerCase().includes('благодарю')
        },
        handle: thanksHandler
    },
})

const systemScenario = createSystemScenario({
    RUN_APP: runAppHandler,
    NO_MATCH: noMatchHandler
})

const scenarioWalker = createScenarioWalker({
    intents,
    recognizer: new SmartAppBrainRecognizer(process.env.SMARTAPP_BRAIN_TOKEN),
    systemScenario,
    userScenario
})

export const handleNlpRequest = async (request: NLPRequest): Promise<NLPResponse> => {
    const req = createSaluteRequest(request)
    const res = createSaluteResponse(request)
    const sessionId = request.uuid.sub
    const session = await storage.resolve(sessionId)
    await scenarioWalker({ req, res, session })

    await storage.save({ id: sessionId, session })

    return res.message
}