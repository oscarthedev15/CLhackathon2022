"use client";

import {
  Typography,
  Stack,
  TextField,
  InputAdornment,
  FormGroup,
  Chip,
  Button,
  FormControl,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Checkbox,
  FormControlLabel as MuiFormControlLabel,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Field, Form, Formik } from "formik";
import React, { useEffect } from "react";
import web3 from "../lib/web3";
import * as Yup from "yup";

interface FormValues {
  title: string;
  acceptDeadline: Date;
  outcomeDeadline: Date;
  acceptAmount: number;
  betAmount: number;
  numArticles: number;
  currKeyword: string;
  apiKeywords: string[];
  chooseSources?: string;
  sources: string[];
}

interface Props {
  onSubmit: (values: FormValues) => void;
  betgame: any;
}

export const MyForm: React.FC<Props> = ({ onSubmit, betgame }) => {
  const [minimumBet, setMinimumBet] = React.useState(0);
  const [serviceFee, setServiceFee] = React.useState(0);

  const options = [
    { label: "ABC News", value: "abc-news" },
    { label: "Associated Press", value: "associated-press" },
    { label: "Buzzfeed", value: "buzzfeed" },
    { label: "CNN", value: "cnn" },
    { label: "Entertainment Weekly", value: "entertainment-weekly" },
    { label: "Fortune", value: "fortune" },
    { label: "MTV News", value: "mtv-news" },
    { label: "NBC News", value: "nbc-news" },
    { label: "Newsweek", value: "newsweek" },
    { label: "New York Magazine", value: "new-york-magazine" },
    { label: "Reuters", value: "reuters" },
    { label: "Techcrunch", value: "techcrunch" },
    { label: "The Huffington Post", value: "the-huffington-post" },
    { label: "The Verge", value: "the-verge" },
    { label: "Time", value: "time" },
    { label: "USA Today", value: "usa-today" },
    { label: "Vice News", value: "vice-news" },
    { label: "Wired", value: "wired" },
  ];

  useEffect(() => {
    async function setContractProps() {
      if (!betgame) return;

      console.log("Setting minBet and serviceFee properties");
      let minBet = await betgame.methods.minimumBetAmount().call();
      minBet = web3.utils.fromWei(minBet, "ether");
      setMinimumBet(minBet);

      let servFeePercentage = await betgame.methods
        .serviceFeePercentage()
        .call();
      // Convert basis points to percentage (e.g., 250 = 2.5%)
      const percentage = Number(servFeePercentage) / 100;
      setServiceFee(percentage);
    }

    setContractProps();
  }, [betgame]);

  const addKeyword = (v: string[], k: string) => {
    console.log("Adding keyword");
    let newArr = v;
    newArr.push(k);
    v = newArr;
    k = "";
    console.log(v);
    console.log(k);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const FormErrorsSchema = Yup.object().shape({
    title: Yup.string()
      .min(2, "Minimum 2 characters required.")
      .max(80, "Maximum 80 characters allowed.")
      .required("Required."),
    acceptDeadline: Yup.date()
      .min(today, "Date cannot be in the past.")
      .max(
        Yup.ref("outcomeDeadline"),
        "Accept by date cannot be after bet expiration date."
      )
      .required("Required.")
      .typeError("You must specify a date."),
    outcomeDeadline: Yup.date()
      .min(
        Yup.ref("acceptDeadline"),
        "Bet expiration date cannot be before accept by date."
      )
      .required("Required.")
      .typeError("You must specify a date."),
    betAmount: Yup.number()
      .typeError("You must specify a number.")
      .min(minimumBet, `Minimum bet amount is ${minimumBet} ETH.`)
      .required("Required."),
    acceptAmount: Yup.number()
      .typeError("You must specify a number.")
      .min(minimumBet, `Minimum bet amount is ${minimumBet} ETH.`)
      .required("Required."),
    numArticles: Yup.number()
      .typeError("You must specify a number.")
      .integer("You can only specify integers.")
      .min(1, "You cannot specify less than 1 article.")
      .required("Required."),
    apiKeywords: Yup.array().test(
      "has-keyword",
      "You must specify at least 1 keyword.",
      function (value) {
        if (value?.length === 0 && this.parent.currKeyword === undefined)
          return false;
        else return true;
      }
    ),
  });

  return (
    <Formik<FormValues>
      initialValues={{
        title: "",
        acceptDeadline: new Date(Date.now()),
        outcomeDeadline: new Date(Date.now()),
        acceptAmount: 0.0,
        betAmount: 0.0,
        numArticles: 1,
        currKeyword: "",
        apiKeywords: [],
        chooseSources: "no",
        sources: [],
      }}
      validationSchema={FormErrorsSchema}
      onSubmit={(values, { resetForm }) => {
        if (values.apiKeywords.length === 0) {
          addKeyword(values.apiKeywords, values.currKeyword);
        }
        onSubmit(values);
      }}
    >
      {({
        values,
        handleChange,
        handleBlur,
        setFieldValue,
        errors,
        touched,
        submitForm,
      }) => (
        <Form style={{ width: "100%" }}>
          <div>
            <Typography component="div">
              <Box
                sx={{ fontFamily: "Poppins", fontStyle: "italic", m: 1, mb: 2 }}
              >
                All fields are required.
              </Box>
            </Typography>
          </div>
          <div>
            <TextField
              placeholder="Bet Title"
              sx={{ width: "75%" }}
              label="Title"
              multiline
              maxRows={4}
              value={values.title}
              onChange={handleChange("title")}
              onBlur={handleBlur("title")}
              error={touched.title && Boolean(errors.title)}
              helperText={touched.title && errors.title}
            />
          </div>
          <div style={{ marginTop: "20px" }}>
            <TextField
              sx={{ width: "50%" }}
              placeholder="i.e. Kanye West"
              label="Keywords"
              value={values.currKeyword}
              onChange={handleChange("currKeyword")}
              onBlur={handleBlur("currKeyword")}
              error={touched.currKeyword && Boolean(errors.apiKeywords)}
              helperText={touched.currKeyword && errors.apiKeywords}
            />
            <Button
              onClick={() => {
                addKeyword(values.apiKeywords, values.currKeyword);
                setFieldValue("currKeyword", "");
              }}
              variant="contained"
              style={{ marginTop: "10px", marginLeft: "10px" }}
              sx={{ textTransform: "none" }}
            >
              <Typography
                textAlign="center"
                sx={{
                  color: "text.primary",
                  fontFamily: "Spline Sans Mono",
                  fontWeight: 900,
                }}
              >
                ADD
              </Typography>
            </Button>
          </div>

          {values.apiKeywords && values.apiKeywords.length > 0 ? (
            <div style={{ marginBottom: "20px" }}>
              <br />
              <Stack direction="row" spacing={1}>
                {values.apiKeywords.map((keyword, index) => (
                  <Chip
                    key={index}
                    label={keyword}
                    color="primary"
                    onDelete={() => {
                      setFieldValue(
                        "apiKeywords",
                        values.apiKeywords.filter((e: string) => e !== keyword)
                      );
                    }}
                  />
                ))}
              </Stack>
            </div>
          ) : null}
          <br />
          <div style={{ marginTop: "20px" }}>
            <FormControl>
              <Typography sx={{ color: "text.primary" }}>
                Would you like to pick the sources?
              </Typography>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={values.chooseSources}
                onChange={handleChange("chooseSources")}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </div>
          {values.chooseSources && values.chooseSources === "yes" ? (
            <div>
              <br />
              <FormControl style={{ display: "flex" }}>
                <Typography component="legend" sx={{ color: "secondary" }}>
                  Sources
                </Typography>
                <FormGroup style={{ marginLeft: "5%" }}>
                  <Grid container spacing={2}>
                    {options.map((opt, index) => (
                      <Grid
                        key={index}
                        sx={{ textAlign: "left" }}
                        size={{ xs: 6, sm: 4, md: 4 }}
                      >
                        <MuiFormControlLabel
                          control={
                            <Checkbox
                              checked={values.sources.includes(opt.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFieldValue("sources", [
                                    ...values.sources,
                                    opt.value,
                                  ]);
                                } else {
                                  setFieldValue(
                                    "sources",
                                    values.sources.filter(
                                      (s) => s !== opt.value
                                    )
                                  );
                                }
                              }}
                              value={opt.value}
                            />
                          }
                          label={opt.label}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </FormGroup>
              </FormControl>
            </div>
          ) : null}
          <div style={{ marginTop: "20px" }}>
            <TextField
              placeholder="Number of Articles"
              label="Number of Articles"
              value={values.numArticles}
              onChange={handleChange("numArticles")}
              onBlur={handleBlur("numArticles")}
              error={touched.numArticles && Boolean(errors.numArticles)}
              helperText={touched.numArticles && errors.numArticles}
            />
          </div>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div style={{ marginTop: "20px" }}>
              <DesktopDatePicker
                label="Accept By Date"
                minDate={new Date()}
                format="MM/dd/yyyy"
                value={values.acceptDeadline}
                onChange={(value) => {
                  setFieldValue("acceptDeadline", value);
                }}
                slotProps={{
                  textField: {
                    sx: { width: "100%" },
                    onChange: handleChange("acceptDeadline"),
                    onBlur: handleBlur("acceptDeadline"),
                    error:
                      touched.acceptDeadline && Boolean(errors.acceptDeadline),
                    helperText:
                      (touched.acceptDeadline as any) &&
                      (errors.acceptDeadline as string),
                  },
                }}
              />
            </div>
            <div style={{ marginTop: "20px" }}>
              <DesktopDatePicker
                label="Expiration Date"
                format="MM/dd/yyyy"
                value={values.outcomeDeadline}
                minDate={new Date()}
                onChange={(value) => {
                  setFieldValue("outcomeDeadline", value);
                }}
                slotProps={{
                  textField: {
                    sx: { width: "100%" },
                    onChange: handleChange("outcomeDeadline"),
                    onBlur: handleBlur("outcomeDeadline"),
                    error:
                      touched.outcomeDeadline &&
                      Boolean(errors.outcomeDeadline),
                    helperText:
                      (touched.outcomeDeadline as any) &&
                      (errors.outcomeDeadline as string),
                  },
                }}
              />
            </div>
          </LocalizationProvider>

          <div style={{ marginTop: "20px" }}>
            <TextField
              placeholder="Bet Amount"
              label="Bet Amount"
              value={values.betAmount}
              onChange={handleChange("betAmount")}
              onBlur={handleBlur("betAmount")}
              error={touched.betAmount && Boolean(errors.betAmount)}
              helperText={touched.betAmount && errors.betAmount}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">ETH</InputAdornment>
                ),
              }}
            />
          </div>
          <div style={{ marginTop: "20px" }}>
            <TextField
              placeholder="Accept Value"
              label="Accept Value"
              value={values.acceptAmount}
              onChange={handleChange("acceptAmount")}
              onBlur={handleBlur("acceptAmount")}
              error={touched.acceptAmount && Boolean(errors.acceptAmount)}
              helperText={touched.acceptAmount && errors.acceptAmount}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">ETH</InputAdornment>
                ),
              }}
            />
          </div>
          <br />
          <Typography sx={{ fontStyle: "italic" }}>
            Note: A service fee of{" "}
            <Box component="span" fontWeight="600" display="inline">
              {serviceFee}%{" "}
            </Box>
            will be included in the transaction total.
          </Typography>
          <br />
          <br />
          <Button
            type="button"
            variant="contained"
            style={{ marginTop: "10px", marginLeft: "10px" }}
            sx={{ textTransform: "none" }}
            onClick={submitForm}
          >
            <Typography
              textAlign="center"
              sx={{
                color: "text.primary",
                fontFamily: "Spline Sans Mono",
                fontWeight: 900,
              }}
            >
              {(() => {
                const betAmt = parseFloat(values.betAmount || "0");
                if (betAmt > 0 && serviceFee > 0) {
                  // serviceFee is stored as percentage (e.g., 5 for 5%)
                  // Convert to basis points for calculation: 5% = 500 basis points
                  const serviceFeeInBasisPoints = serviceFee * 100;
                  const total =
                    betAmt * (10000 / (10000 - serviceFeeInBasisPoints));
                  const fee = total - betAmt;
                  return `CREATE: ${betAmt.toFixed(4)} ETH + ${fee.toFixed(
                    6
                  )} ETH fee`;
                }
                return "CREATE";
              })()}
            </Typography>
          </Button>
        </Form>
      )}
    </Formik>
  );
};
