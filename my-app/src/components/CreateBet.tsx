import Button from '@mui/material/Button'
import { useState } from 'react'
import { useMoralis } from 'react-moralis'
import betgame from '../betgame'
import web3 from '../web3'
import { MyForm } from './Form'

function CreateBet() {
  // const [name, setName] = React.useState('Composed TextField');
  const [title, setTitle] = useState('Hey there')
  const {
    authenticate,
    isAuthenticated,
    isAuthenticating,
    user,
    account,
    logout,
  } = useMoralis()

  // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //     setName(event.target.value);
  //   };

  const buildApiURL = (apiKeywords: string[], sources: string[]) => {
    let beginningStr = 'https://newsapi.org/v2/everything?'

    // should store API key somewhere else
    let endingStr =
      '&searchin=title&language=en&pagesize=1&apiKey=340014d50e764937b75f19426bdd5265'

    // what if user enters something with a space?
    let keywordStr = ''
    apiKeywords.forEach((keyword, index) => {
      if (index !== apiKeywords.length - 1) {
        keywordStr = keywordStr + '+' + keyword + ','
      } else {
        keywordStr = keywordStr + '+' + keyword
      }
    })
    keywordStr = encodeURIComponent(keywordStr)
    let tmp = 'q='
    keywordStr = tmp.concat(keywordStr)
    console.log(keywordStr)

    // if sources is empty, this shouldn't cause issues (it will query all sources)
    let sourceStr = '&sources='
    sources.forEach((source, index) => {
      if (index !== sources.length - 1) {
        sourceStr = sourceStr + source + ','
      } else {
        sourceStr = sourceStr + source
      }
    })
    // console.log(sourceStr)

    let finalApiURL = beginningStr.concat(keywordStr, sourceStr, endingStr)

    // console.log(finalApiURL)

    // console.log(
    //   finalApiURL ===
    //     'https://newsapi.org/v2/everything?q=+rocky,+arrest&sources=the-verge,time,the-huffington-post&searchin=title&language=en&pagesize=1&apiKey=340014d50e764937b75f19426bdd5265',
    // )

    return finalApiURL
  }

  const convertToUnix = (date: Date) => {
    date.setHours(23, 59, 59, 99)

    let unixTimestamp = Math.floor(date.getTime() / 1000)
    // console.log(unixTimestamp)
    return unixTimestamp
  }

  const createBet = async (
    apiURL: string,
    acceptValue: string,
    countArts: number,
    endDate: number,
    acceptDate: number,
    betAmount: string,
    title: string,
  ) => {
    console.log('Calling createBet function')
    const userAddress = await user!.get('ethAddress')

    await betgame.methods
      .createBet(
        apiURL,
        web3.utils.toWei(acceptValue, 'ether'),
        countArts,
        endDate,
        acceptDate,
        title,
      )
      .send({
        from: userAddress,
        value: web3.utils.toWei(betAmount, 'ether'),
      })
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <MyForm
        onSubmit={({
          title,
          acceptDeadline,
          outcomeDeadline,
          acceptAmount,
          betAmount,
          numArticles,
          apiKeywords,
          sources,
        }) => {
          const apiURL = buildApiURL(apiKeywords, sources)
          console.log(apiURL)
          const unixAcceptDate = convertToUnix(acceptDeadline)
          console.log(unixAcceptDate)
          const unixExpirationDate = convertToUnix(outcomeDeadline)
          console.log(unixExpirationDate)
          const acceptAmountStr = acceptAmount.toString()
          console.log('Accept:', acceptAmountStr)
          const betAmountStr = betAmount.toString()
          console.log('Bet:', betAmountStr)

          createBet(
            apiURL,
            acceptAmountStr,
            numArticles,
            unixExpirationDate,
            unixAcceptDate,
            betAmountStr,
            title,
          )
        }}
      />
      {isAuthenticated ? (
        <h1>{user!.get('ethAddress')}</h1>
      ) : (
        <h1>User is not authenticated!</h1>
      )}
    </div>
  )
}

export default CreateBet
