import { FormControl, FormLabel, Grid, OutlinedInput } from '@mui/material'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import FormGroup from '@mui/material/FormGroup'
import FormHelperText from '@mui/material/FormHelperText'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { Field, Form, Formik } from 'formik'
import { CheckboxWithLabel } from 'formik-material-ui'
import React, { useEffect } from 'react'
import betgame from '../betgame'
import web3 from '../web3'

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
    console.log('Setting contract properties')
    let minBet = await betgame.methods.minimumBet().call()
    minBet = web3.utils.fromWei(minBet)
    setMinimumBet(minBet)
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

  return (
    <Formik
      initialValues={{
        title: '',
        acceptDeadline: new Date(Date.now()),
        outcomeDeadline: new Date(Date.now()),
        acceptAmount: 0.0,
        betAmount: 0.0,
        numArticles: 1,
        currKeyword: '',
        apiKeywords: [],
        sources: [],
      }}
      onSubmit={(values) => {
        onSubmit(values)
      }}
    >
      {({ values, handleChange, handleBlur, setFieldValue }) => (
        <Form>
          <div>
            <TextField
              placeholder="Title for bet"
              label="title"
              multiline
              maxRows={4}
              value={values.title}
              onChange={handleChange('title')}
              onBlur={handleBlur('title')}
            />
          </div>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div>
              <DesktopDatePicker
                label="Accept by date"
                inputFormat="MM/dd/yyyy"
                value={values.acceptDeadline}
                onChange={(value) => {
                  setFieldValue('acceptDeadline', value)
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </div>
            <div>
              <DesktopDatePicker
                label="Bet expiration date"
                inputFormat="MM/dd/yyyy"
                value={values.outcomeDeadline}
                onChange={(value) => {
                  setFieldValue('outcomeDeadline', value)
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </div>
          </LocalizationProvider>
          <div>
            <FormControl>
              <OutlinedInput
                id="outlined-adornment-weight"
                placeholder="0.001"
                value={values.betAmount}
                onChange={handleChange('betAmount')}
                endAdornment={
                  <InputAdornment position="end">ETH</InputAdornment>
                }
                aria-describedby="outlined-weight-helper-text"
                // inputProps={{
                //   'aria-label': 'weight',
                // }}
              />
              <FormHelperText id="outlined-weight-helper-text">
                Bet Amount
              </FormHelperText>
            </FormControl>
            <p>Minimum bet amount is {minimumBet} ETH</p>
          </div>
          <div>
            <FormControl>
              <OutlinedInput
                id="outlined-adornment-weight"
                placeholder="0.001"
                value={values.acceptAmount}
                onChange={handleChange('acceptAmount')}
                endAdornment={
                  <InputAdornment position="end">ETH</InputAdornment>
                }
                aria-describedby="outlined-weight-helper-text"
                // inputProps={{
                //   'aria-label': 'weight',
                // }}
              />
              <FormHelperText id="outlined-weight-helper-text">
                Accept Value
              </FormHelperText>
            </FormControl>
            <p>Minimum accept value is {minimumBet} ETH</p>
          </div>
          <div>
            <FormControl>
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
              <FormHelperText id="outlined-weight-helper-text">
                Number of Articles
              </FormHelperText>
            </FormControl>
            <p>
              Change this value only if you specified a number of articles as a
              condition of the bet.
            </p>
          </div>
          <div>
            <TextField
              placeholder='i.e. "Pop Book"'
              label="Keywords"
              value={values.currKeyword}
              onChange={handleChange('currKeyword')}
              onBlur={handleBlur('currKeyword')}
            />
            <Button
              onClick={() => {
                addKeyword(values.apiKeywords, values.currKeyword)
                setFieldValue('currKeyword', '')
              }}
              variant="outlined"
            >
              Add
            </Button>
            {/* <p>
              Enter the keywords that will be used to check news headlines,
              hitting enter after each entry. Maximum number of keywords is 8.
            </p> */}
          </div>
          <br />
          {values.apiKeywords && values.apiKeywords.length > 0 ? (
            <div>
              <h4>Keywords:</h4>
              <Stack direction="row" spacing={1} justifyContent="center">
                {values.apiKeywords.map((keyword, index) => (
                  <Chip
                    key={index}
                    label={keyword}
                    variant="outlined"
                    onDelete={() => {
                      setFieldValue(
                        'apiKeywords',
                        values.apiKeywords.filter((e: string) => e !== keyword),
                      )
                    }}
                  />
                ))}
              </Stack>
            </div>
          ) : (
            <h4>Keywords will appear here once you add them.</h4>
          )}
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
          <br />
          <Button type="submit" variant="outlined">
            Create
          </Button>
          <pre>{JSON.stringify(values, null, 2)}</pre>
        </Form>
      )}
    </Formik>
  )
}
