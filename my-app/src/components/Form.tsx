import {
  FormHelperText,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  FormGroup,
  Chip,
  Button,
  FormControl,
  FormLabel,
  Grid,
  OutlinedInput,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { Field, Form, Formik } from 'formik'
import { CheckboxWithLabel } from 'formik-material-ui'
import React, { useEffect, useState } from 'react'
import betgame from '../betgame'
import web3 from '../web3'
import * as Yup from 'yup'

interface FormValues {
  title: string
  acceptDeadline: Date
  outcomeDeadline: Date
  acceptAmount: number
  betAmount: number
  numArticles: number
  currKeyword: string
  apiKeywords: string[]
  sources: string[]
}

interface Props {
  onSubmit: (values: FormValues) => void
}

export const MyForm: React.FC<Props> = ({ onSubmit }) => {
  const [minimumBet, setMinimumBet] = React.useState(0)
  const [serviceFee, setServiceFee] = React.useState(0)

  const options = [
    {
      label: 'ABC News',
      value: 'abc-news',
    },
    {
      label: 'Associated Press',
      value: 'associated-press',
    },
    {
      label: 'BBC News',
      value: 'bbc-news',
    },
    {
      label: 'Bloomberg',
      value: 'bloomberg',
    },
    {
      label: 'Business Insider',
      value: 'business-insider',
    },
    {
      label: 'Buzzfeed',
      value: 'buzzfeed',
    },
    {
      label: 'CBS News',
      value: 'cbs-news',
    },
    {
      label: 'CNN',
      value: 'cnn',
    },
    {
      label: 'Entertainment Weekly',
      value: 'entertainment-weekly',
    },
    {
      label: 'ESPN',
      value: 'espn',
    },

    {
      label: 'Fortune',
      value: 'fortune',
    },
    {
      label: 'Fox News',
      value: 'fox-news',
    },
    {
      label: 'Google News',
      value: 'google-news',
    },
    {
      label: 'MTV News',
      value: 'mtv-news',
    },
    {
      label: 'NBC News',
      value: 'nbc-news',
    },
    {
      label: 'Newsweek',
      value: 'newsweek',
    },
    {
      label: 'New York Magazine',
      value: 'new-york-magazine',
    },
    {
      label: 'Politico',
      value: 'politico',
    },
    {
      label: 'Reuters',
      value: 'reuters',
    },
    {
      label: 'Techcrunch',
      value: 'techcrunch',
    },
    {
      label: 'The Huffington Post',
      value: 'the-huffington-post',
    },
    {
      label: 'The Verge',
      value: 'the-verge',
    },
    {
      label: 'The Wall Street Journal',
      value: 'the-wall-street-journal',
    },
    {
      label: 'Time',
      value: 'time',
    },
    {
      label: 'USA Today',
      value: 'usa-today',
    },

    {
      label: 'Vice News',
      value: 'vice-news',
    },
    {
      label: 'Wired',
      value: 'wired',
    },
  ]

  useEffect(() => {
    // Create a scoped async function in the hook
    async function anyNameFunction() {
      await setContractProps()
    }
    // Execute the created function directly
    anyNameFunction()
  }, [minimumBet])

  const setContractProps = async () => {
    console.log('Setting minBet and serviceFee properties')
    let minBet = await betgame.methods.minimumBet().call()
    minBet = web3.utils.fromWei(minBet)
    setMinimumBet(minBet)

    let servFee = await betgame.methods.serviceFee().call()
    servFee = web3.utils.fromWei(servFee)
    setServiceFee(servFee)
  }

  const addKeyword = (v: string[], k: string) => {
    console.log('Adding keyword')
    let newArr = v
    newArr.push(k)
    v = newArr
    k = ''
    console.log(v)
    console.log(k)
  }

  const deleteKeyword = (v: string[], k: string) => {
    console.log('Deleting keyword', k)
    v = v.filter((e) => e !== k)
    console.log(v)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const FormErrorsSchema = Yup.object().shape({
    title: Yup.string()
      .min(2, 'Minimum 2 characters required.')
      .max(80, 'Maximum 80 characters allowed.')
      .required('Required.'),
    acceptDeadline: Yup.date()
      .min(today, 'Date cannot be in the past.')
      .max(
        Yup.ref('outcomeDeadline'),
        'Accept by date cannot be after bet expiration date.',
      )
      .required('Required.')
      .typeError('You must specify a date.'),
    outcomeDeadline: Yup.date()
      .min(
        Yup.ref('acceptDeadline'),
        'Bet expiration date cannot be before accept by date.',
      )
      .required('Required.')
      .typeError('You must specify a date.'),
    betAmount: Yup.number()
      .typeError('You must specify a number.')
      .min(minimumBet, `Minimum bet amount is ${minimumBet} ETH.`)
      .required('Required.'),
    acceptAmount: Yup.number()
      .typeError('You must specify a number.')
      .min(minimumBet, `Minimum bet amount is ${minimumBet} ETH.`)
      .required('Required.'),
    numArticles: Yup.number()
      .typeError('You must specify a number.')
      .integer('You can only specify integers.')
      .min(1, 'You cannot specify less than 1 article.')
      .required('Required.'),
    apiKeywords: Yup.array().min(1, 'You must specify at least 1 keyword.'),
  })

  return (
    <Formik
      initialValues={{
        title: '',
        acceptDeadline: new Date(Date.now()),
        outcomeDeadline: new Date(Date.now()),
        acceptAmount: 0.0, //should these be initialized to minBet?
        betAmount: 0.0, //should these be initialized to minBet?
        numArticles: 1,
        currKeyword: '',
        apiKeywords: [],
        chooseSources: 'no',
        sources: [],
      }}
      validationSchema={FormErrorsSchema}
      onSubmit={(values) => {
        if (values.chooseSources === 'no') {
          const allSources = options.map((option) => option.value)
          values.sources = allSources as any
        }
        onSubmit(values)
      }}
    >
      {({
        values,
        handleChange,
        handleBlur,
        setFieldValue,
        errors,
        touched,
      }) => (
        <Form>
          <div>
            <Typography variant="h2" m={2}>
              Create a Bet
            </Typography>
          </div>
          <div>
            <TextField
              placeholder="Bet Title"
              label="Title"
              multiline
              maxRows={6}
              value={values.title}
              onChange={handleChange('title')}
              onBlur={handleBlur('title')}
              margin={'normal'}
              className="spacing"
              error={touched.title && Boolean(errors.title)}
              helperText={touched.title && errors.title}
            />
          </div>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="spacing">
              <DesktopDatePicker
                label="Accept by date"
                inputFormat="MM/dd/yyyy"
                value={values.acceptDeadline}
                onChange={(value) => {
                  setFieldValue('acceptDeadline', value)
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    onChange={handleChange('acceptDeadline')}
                    onBlur={handleBlur('acceptDeadline')}
                    error={
                      touched.acceptDeadline && Boolean(errors.acceptDeadline)
                    }
                    helperText={
                      (touched.acceptDeadline as string) &&
                      (errors.acceptDeadline as string)
                    }
                  />
                )}
                //errorText={touched.acceptDeadline && Boolean(errors.acceptDeadline)}
                //helperText={touched.acceptDeadline && errors.acceptDeadline}
              />
            </div>
            <div className="spacing">
              <DesktopDatePicker
                label="Bet expiration date"
                inputFormat="MM/dd/yyyy"
                value={values.outcomeDeadline}
                onChange={(value) => {
                  setFieldValue('outcomeDeadline', value)
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    onChange={handleChange('outcomeDeadline')}
                    onBlur={handleBlur('outcomeDeadline')}
                    error={
                      touched.outcomeDeadline && Boolean(errors.outcomeDeadline)
                    }
                    helperText={
                      (touched.outcomeDeadline as string) &&
                      (errors.outcomeDeadline as string)
                    }
                    //helperText={touched.outcomeDeadline && errors.outcomeDeadline}
                  />
                )}
              />
            </div>
          </LocalizationProvider>
          {/* 
          <div className="spacing">
            <FormControl id="betAmount">
            <p>Minimum bet amount is {minimumBet} ETH</p>
            <FormHelperText id="outlined-weight-helper-text">
                Bet Amount
            </FormHelperText>
              <OutlinedInput
                id="betAmount"
                // placeholder="0.001"
                value={values.betAmount}
                onChange={handleChange('betAmount')}
                onBlur={handleBlur('betAmount')}
                endAdornment={
                  <InputAdornment position="end">ETH</InputAdornment>
                }
                aria-describedby="outlined-weight-helper-text"
                // inputProps={{
                //   'aria-label': 'weight',
                // }}
                error={touched.betAmount && Boolean(errors.betAmount)}
              />
                          {
                <FormHelperText error>
                  {errors.betAmount}
                </FormHelperText>
              }
            </FormControl>
          </div>
           */}

          <div>
            <TextField
              placeholder="Bet Amount"
              label="Bet Amount"
              value={values.betAmount}
              onChange={handleChange('betAmount')}
              onBlur={handleBlur('betAmount')}
              margin={'normal'}
              className="spacing"
              error={touched.betAmount && Boolean(errors.betAmount)}
              helperText={touched.betAmount && errors.betAmount}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">ETH</InputAdornment>
                ),
              }}
            />
          </div>
          <div>
            <TextField
              placeholder="Accept Value"
              label="Accept Value"
              value={values.acceptAmount}
              onChange={handleChange('acceptAmount')}
              onBlur={handleBlur('acceptAmount')}
              margin={'normal'}
              className="spacing"
              error={touched.acceptAmount && Boolean(errors.acceptAmount)}
              helperText={touched.acceptAmount && errors.acceptAmount}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">ETH</InputAdornment>
                ),
              }}
            />
          </div>
          {/* <div className="spacing">
            <FormControl id="acceptAmount">
            <FormHelperText id="outlined-weight-helper-text">
                Accept Value
              </FormHelperText>
              <OutlinedInput
                id="acceptAmount"
                placeholder="0.001"
                value={values.acceptAmount}
                onChange={handleChange('acceptAmount')}
                onBlur={handleBlur('acceptAmount')}
                endAdornment={
                  <InputAdornment position="end">ETH</InputAdornment>
                }
                aria-describedby="outlined-weight-helper-text"
                // inputProps={{
                //   'aria-label': 'weight',
                // }}
                error={touched.acceptAmount && Boolean(errors.acceptAmount)}
              />
              {
                <FormHelperText error>
                  {errors.acceptAmount}
                </FormHelperText>
              }            
              </FormControl>
          </div> */}

          <div className="spacing">
            <TextField
              placeholder="Number of Articles"
              label="Number of Articles"
              value={values.numArticles}
              onChange={handleChange('numArticles')}
              onBlur={handleBlur('numArticles')}
              margin={'normal'}
              error={touched.numArticles && Boolean(errors.numArticles)}
              helperText={touched.numArticles && errors.numArticles}
            />
          </div>
          {/* <div className="spacing">
            <FormControl>
            <FormHelperText id="outlined-weight-helper-text">
                Number of Articles
              </FormHelperText>
              <OutlinedInput
                id="outlined-adornment-weight"
                // placeholder="1"
                value={values.numArticles}
                onChange={handleChange('numArticles')}
                // endAdornment={
                //   <InputAdornment position="end">ETH</InputAdornment>
                // }
                aria-describedby="outlined-weight-helper-text"
                // inputProps={{
                //   'aria-label': 'weight',
                // }}
              />
            </FormControl>
            <p>
              Change this value only if you specified a number of articles as a
              condition of the bet.
            </p>
          </div> */}
          <div>
            <TextField
              placeholder='i.e. "Pop Book"'
              label="Keywords"
              value={values.currKeyword}
              onChange={handleChange('currKeyword')}
              onBlur={handleBlur('currKeyword')}
              className="spacing"
              error={touched.currKeyword && Boolean(errors.apiKeywords)}
              helperText={touched.currKeyword && errors.apiKeywords}
            />
          </div>
          <div>
            <Button
              onClick={() => {
                addKeyword(values.apiKeywords, values.currKeyword)
                setFieldValue('currKeyword', '')
              }}
              variant="outlined"
              style={{ marginTop: '10px' }}
            >
              Add
            </Button>
            {/* <p>
              Enter the keywords that will be used to check news headlines,
              hitting enter after each entry. Maximum number of keywords is 8.
            </p> */}
          </div>
          <br />
          {
            values.apiKeywords && values.apiKeywords.length > 0 ? (
              <div className="margin-bottom">
                {/* <h4>Keywords:</h4> */}
                <Stack direction="row" spacing={1} justifyContent="center">
                  {values.apiKeywords.map((keyword, index) => (
                    <Chip
                      key={index}
                      label={keyword}
                      variant="outlined"
                      onDelete={() => {
                        setFieldValue(
                          'apiKeywords',
                          values.apiKeywords.filter(
                            (e: string) => e !== keyword,
                          ), //if theres a duplicate word this will delete them both
                        )
                      }}
                    />
                  ))}
                </Stack>
              </div>
            ) : null
            // <h4 className="margin">Keywords will appear here once you add them.</h4>
          }
          <div className="margin-top">
            <FormControl>
              <FormLabel>Would you like to pick the sources?</FormLabel>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={values.chooseSources}
                onChange={handleChange('chooseSources')}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </div>
          {values.chooseSources && values.chooseSources === 'yes' ? (
            <div>
              <FormControl style={{ display: 'flex' }}>
                <FormLabel component="legend">Sources</FormLabel>
                <FormGroup>
                  <Grid
                    container
                    // spacing={{ xs: 2 }}
                    columns={{ xs: 4, sm: 8 }}
                  >
                    {options.map((opt, index) => (
                      <Grid
                        item
                        xs={6}
                        sm={4}
                        md={4}
                        key={index}
                        textAlign="left"
                      >
                        <Field
                          type="checkbox"
                          component={CheckboxWithLabel}
                          name="sources"
                          key={opt.value}
                          value={opt.value}
                          Label={{ label: opt.label }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </FormGroup>
              </FormControl>
            </div>
          ) : null}

          <br />
          <h3>
            In addition to the bet amount of {values.betAmount} ETH you
            specified, an additional service fee of {serviceFee} ETH will be
            added to the transaction total.
          </h3>
          <Button type="submit" variant="outlined">
            Create
          </Button>
          <pre>{JSON.stringify(values, null, 2)}</pre>
        </Form>
      )}
    </Formik>
  )
}
