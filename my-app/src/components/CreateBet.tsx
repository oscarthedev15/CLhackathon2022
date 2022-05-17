import React, { useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import ResponsiveAppBar from './Nav';

import Box from '@mui/material/Box';
import FilledInput from '@mui/material/FilledInput';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import CalendarPicker from '@mui/x-date-pickers/CalendarPicker';
import Button from '@mui/material/Button';

import web3 from '../web3';

import { MyForm } from './Form';

function CreateBet() {
  // const [name, setName] = React.useState('Composed TextField');
  const [title, setTitle] = React.useState('Hey there');

  // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //     setName(event.target.value);
  //   };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const createBet = async () => {
    // await
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <MyForm
        onSubmit={({
          title,
          acceptDeadline,
          outcomeDeadline,
          amount,
          keywords,
        }) => {
          console.log(title, acceptDeadline, outcomeDeadline, amount, keywords);
        }}
      />
      {/* <Box>
        <Container maxWidth="sm" className="card">
          <h1>Create a Bet</h1>
          <h3>1. Title</h3>
          <TextField
            id="outlined-multiline-flexible"
            // label=""
            multiline
            fullWidth
            maxRows={4}
            value={title}
            onChange={handleChange}
          />
          <h3>2. Bet Acceptance Deadline</h3>
          <p>
            The date by which the bet must be accepted. Must fall before or on
            the start date of the bet, if specified.
          </p>
          <h3>3. Bet Outcome Deadline</h3>
          <Button onClick={createBet} variant="outlined">
            Create
          </Button>
        </Container>
      </Box> */}
    </div>
  );
}

export default CreateBet;
