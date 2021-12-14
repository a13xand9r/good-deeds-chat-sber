import { SaluteHandler } from '@salutejs/scenario'
import axios from 'axios'
import * as dictionary from './system.i18n'
import { addSSML, changeAppealText, getUniqDeal } from './utils/utils'

export const runAppHandler: SaluteHandler = ({ req, res, session }, dispatch) => {
    session.oldDeals = []
    session.dealsCount = 0
    dispatch && dispatch(['Hello'])
}

export const noMatchHandler: SaluteHandler = ({ req, res }) => {
    const keyset = req.i18n(dictionary)
    res.setPronounceText(keyset('404'))
    res.appendBubble(keyset('404'))
    res.appendSuggestions(['Получить доброе дело', 'Хватит'])
}

export const helloHandler: SaluteHandler = ({ req, res }) => {
    const keyset = req.i18n(dictionary)
    const responseText = keyset('Привет')
    res.setPronounceText(responseText)
    res.appendBubble(responseText)
    res.setAutoListening(true)
    res.appendSuggestions(['Да', 'Нет'])
}

export const dealHandler: SaluteHandler = ({ req, res, session }) => {
    if (!session.dealsCount) session.dealsCount = 0
    //@ts-ignore
    session.dealsCount = session.dealsCount + 1
    if (!session.oldDeals) session.oldDeals = []
    const {deal, dealId} = getUniqDeal(session.oldDeals as number[], req.request.payload.character.appeal)
    const dealMessage = changeAppealText(deal, req.request.payload.character.appeal)
    //@ts-ignore
    session.oldDeals.push(dealId)
    if (deal){
        const suggestions = ['Ещё', 'Хватит']
        //@ts-ignore
        if (session.dealsCount && session.dealsCount === 10){
            suggestions.push('Оценить приложение')
            session.dealsCount = 0
        }
        res.setPronounceText(`<speak>${addSSML(dealMessage)}</speak>`, {ssml: true})
        res.appendBubble(dealMessage)
        res.appendSuggestions(suggestions)
    } else {
        res.setPronounceText('На сегодня у меня закончились добрые дела')
        res.appendBubble('На сегодня у меня закончились добрые дела')
    }
}

export const thanksHandler: SaluteHandler = ({ req, res }) => {
    const keyset = req.i18n(dictionary)

    const responseText = keyset('Спасибо')
    res.setPronounceText(responseText)
    res.appendBubble(responseText)
    res.appendSuggestions(['Ещё', 'Хватит'])
}


