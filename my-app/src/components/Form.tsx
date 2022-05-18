import { Box, FormControl, OutlinedInput } from '@mui/material';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Form, Formik } from 'formik';
import React, { useEffect } from 'react';
import betgame from '../betgame';
import web3 from '../web3';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

interface FormValues {
  title: string;
  acceptDeadline: number;
  outcomeDeadline: number;
  acceptAmount: number;
  betAmount: number;
  numArticles: number;
  currKeyword: string;
  apiKeywords: { id: number; keyword: string }[];
  sources: string[];
}

interface Props {
  onSubmit: (values: FormValues) => void;
}

export const MyForm: React.FC<Props> = ({ onSubmit }) => {
  const [minimumBet, setMinimumBet] = React.useState(0);
  const [keywordID, setKeywordID] = React.useState(2);
  // const [currKeyword, setCurrKeyword] = React.useState('i.e. Pop Book');

  useEffect(() => {
    // Create a scoped async function in the hook
    async function anyNameFunction() {
      await setContractProps();
    }
    // Execute the created function directly
    anyNameFunction();
  }, []);

  const setContractProps = async () => {
    console.log('Setting contract properties');
    let minBet = await betgame.methods.minimumBet().call();
    minBet = web3.utils.fromWei(minBet);
    setMinimumBet(minBet);
  };

  // const handleKeywordChange = () => {
  //   setCurrKeyword(value);
  // };

  const addKeyword = (
    v: { id: number; keyword: string }[],
    keyword: string
  ) => {
    // add keyword to apiKeywords array
    let newArr = v;
    let id = keywordID;
    let newKeyword = { id, keyword };
    newArr.push(newKeyword);
    v = newArr;
    // increment ID for next time
    let tmp = keywordID + 1;
    setKeywordID(tmp);
    console.log(keywordID);
  };

  const deleteKeyword = () => {
    // delete keyword from apiKeywords array using filter()?
  };

  return (
    <Formik
      initialValues={{
        title: '',
        acceptDeadline: Date.now(),
        outcomeDeadline: Date.now(),
        acceptAmount: 0.0,
        betAmount: 0.0,
        numArticles: 1,
        currKeyword: '',
        apiKeywords: [{ id: 1, keyword: 'hi' }],
        sources: [],
      }}
      onSubmit={(values) => {
        onSubmit(values);
      }}
    >
      {({ values, handleBlur, setFieldValue, handleChange }) => (
        <Form>
          <div>
            <TextField
              placeholder="Title for bet"
              label="title"
              multiline
              maxRows={4}
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
          {/* <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div>
              <DesktopDatePicker
                label="Accept by date"
                inputFormat="MM/dd/yyyy"
                value={values.acceptDeadline}
                onChange={(value) => {
                  setFieldValue('acceptDeadline', value);
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
                  setFieldValue('outcomeDeadline', value);
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </div>
          </LocalizationProvider> */}
          {/* <div>
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
          </div> */}
          {/* <div>
            <TextField
              placeholder='i.e. "Pop Book"'
              label="Keywords"
              value={values.currKeyword}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <p>
              Enter the apiKeywords that will be used to check news headlines,
              hitting enter after each entry. Maximum number of apiKeywords is
              8.
            </p>
          </div>
          <div>
            <Button
              onClick={() => addKeyword(values.apiKeywords, 'hello')}
              variant="outlined"
            >
              Add
            </Button>
          </div>
          <Stack direction="row" spacing={1}>
            {values.apiKeywords.map((keyword) => (
              <Chip
                key={keyword.id}
                label={keyword.keyword}
                variant="outlined"
                onDelete={deleteKeyword}
              />
              // <div key={keyword.id}>{keyword.keyword}</div>
            ))}
          </Stack>
          <div>
            <TextField
              placeholder="TMZ
              New York Times"
              label="Sources"
              multiline
              maxRows={4}
              value={values.sources}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <p>
              Enter the news sources to query, hitting enter after each query.
              Maximum number of sources is 4.
            </p>
          </div>
          <Button type="submit" variant="outlined">
            Create
          </Button> */}
          <pre>{JSON.stringify(values, null, 2)}</pre>
        </Form>
      )}
    </Formik>
  );
};
