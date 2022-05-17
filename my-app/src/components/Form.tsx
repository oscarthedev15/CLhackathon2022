import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Form, Formik } from 'formik';
import React from 'react';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface Values {
  title: string;
  acceptDeadline: number;
  outcomeDeadline: number;
  amount: number;
  keywords: string[];
}

interface Props {
  onSubmit: (values: Values) => void;
}

export const MyForm: React.FC<Props> = ({ onSubmit }) => {
  return (
    <Formik
      initialValues={{
        title: '',
        acceptDeadline: Date.now(),
        outcomeDeadline: Date.now(),
        amount: 0,
        keywords: [''],
      }}
      onSubmit={(values) => {
        onSubmit(values);
      }}
    >
      {({ values, handleChange, handleBlur, setFieldValue }) => (
        <Form>
          <div>
            <TextField
              placeholder="Title for bet"
              name="title"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
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
          </LocalizationProvider>
          <Button type="submit" variant="outlined">
            Create
          </Button>
          <pre>{JSON.stringify(values, null, 2)}</pre>
        </Form>
      )}
    </Formik>
  );
};
