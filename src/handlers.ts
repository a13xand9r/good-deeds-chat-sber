import { SaluteHandler } from '@salutejs/scenario'
import axios from 'axios'
import * as dictionary from './system.i18n'
import { addSSML, changeAppealText, getUniqDeal } from './utils/utils'

export const runAppHandler: SaluteHandler = ({ req, res, session }, dispatch) => {
    session.oldDeals = []
    dispatch && dispatch(['Hello'])
}

export const noMatchHandler: SaluteHandler = ({ req, res }) => {
    const keyset = req.i18n(dictionary)
    res.setPronounceText(keyset('404'))
    res.appendBubble(keyset('404'))
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

    if (!session.oldDeals) session.oldDeals = []
    const {deal, dealId} = getUniqDeal(session.oldDeals as number[], req.request.payload.character.appeal)
    const dealMessage = changeAppealText(deal, req.request.payload.character.appeal)
    //@ts-ignore
    session.oldDeals.push(dealId)
    if (deal){
        res.setPronounceText(`<speak>${addSSML(dealMessage)}</speak>`, {ssml: true})
        res.appendBubble(dealMessage)
        res.appendSuggestions(['Ещё', 'Хватит'])
    } else {
        res.setPronounceText('На сегодня у меня закончились комплименты')
        res.appendBubble('На сегодня у меня закончились комплименты')
    }
}

export const thanksHandler: SaluteHandler = ({ req, res }) => {
    const keyset = req.i18n(dictionary)

    const responseText = keyset('Спасибо')
    res.setPronounceText(responseText)
    res.appendBubble(responseText)
    res.appendSuggestions(['Ещё', 'Хватит'])
}


