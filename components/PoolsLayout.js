import React from "react";
import { Grid, Container } from "@mui/material";
import PoolCard from "./PoolCard";

const PoolsLayout = ({ pools }) => {
  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {pools.map((pool, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <PoolCard {...pool} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default PoolsLayout;
