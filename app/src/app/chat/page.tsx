"use client";

import { Typography, Card } from "@mui/material";

export default function Chat() {
  return (
    <div
      style={{
        marginTop: "5%",
        marginBottom: "5%",
        marginLeft: "10%",
        marginRight: "10%",
      }}
    >
      <Typography
        sx={{
          fontFamily: "Spline Sans Mono",
          fontSize: 45,
          fontWeight: 700,
          fontStyle: "italic",
        }}
        gutterBottom
        color="secondary.main"
      >
        Chat
      </Typography>
      <Card sx={{ minWidth: 275, mb: 5, p: 2 }} raised>
        <Typography align="center" sx={{ p: 3 }}>
          Chat functionality coming soon!
        </Typography>
      </Card>
    </div>
  );
}
