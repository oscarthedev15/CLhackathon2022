import { Alert, AlertTitle} from '@mui/material'
import { useState, useEffect } from 'react'
import { useMoralis } from 'react-moralis'
import betgame from '../betgame'
import web3 from '../web3'
import { MyForm } from './Form'
import { Box, Card, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom';


function CreateBet() {
  // const [name, setName] = React.useState('Composed TextField');
  const [submitError, setSubmitError] = useState(false);
  const {
    isAuthenticated,
    user,
  } = useMoralis()

  const navigate = useNavigate();

  // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //     setName(event.target.value);
  //   };

  const [serviceFee, setServiceFee] = useState('')

  useEffect(() => {
    async function anyNameFunction() {
      await setContractProp()
    }
    // Execute the created function directly
    anyNameFunction()
  }, [])

  const setContractProp = async () => {
    console.log('Setting serviceFee property')

    let servFee = await betgame.methods.serviceFee().call()
    setServiceFee(servFee)
  }
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
    let chargeAmount = parseInt(betAmount) + parseInt(serviceFee)
    console.log('Charge amount: ', chargeAmount.toString())
    console.log(chargeAmount === 2000000000000000)

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
        value: chargeAmount,
      }).then (function (result: any) {
        setSubmitError(false);
        navigate('/BetMarketplace', {state: {success: true}});
      }).catch (function (error: any){
        setSubmitError(true);
      });
      //   value: chargeAmount,
       }
  

  return (
    <div style={{ margin: '5%' }}>
      {submitError ? 
      (<Alert severity="error" onClose={() => {setSubmitError(false)}}>
      <AlertTitle>Error</AlertTitle>
        Bet creation failed, please try again.
        </Alert>) 
        : null}
      <Typography
        sx={{
          fontFamily: 'Spline Sans Mono',
          fontSize: 30,
          fontWeight: 700,
          fontStyle: 'italic',
        }}
        gutterBottom
        color="secondary.main"
      >
        Create Bet
      </Typography>
      <Box sx={{ width: '100%' }}>
        <Card sx={{ minWidth: 275, mb: 5, p: 2 }} raised>
          
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
              let betAmountWei = web3.utils.toWei(betAmountStr, 'ether')
              console.log('Bet:', betAmountStr)
              createBet(
                apiURL,
                acceptAmountStr,
                numArticles,
                unixExpirationDate,
                unixAcceptDate,
                betAmountWei,
                title,
              )
            }}
          />
          {/* {isAuthenticated ? (
            <h1>{user!.get('ethAddress')}</h1>
          ) : (
            <h1>User is not authenticated!</h1>
          )} */}
        </Card>
      </Box>
    </div>
  )
      }
    
export default CreateBet
