"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import Link from "next/link";
import { useWeb3 } from "../lib/Web3Context";
import detectEthereumProvider from "@metamask/detect-provider";
import web3 from "../lib/web3";

const pages = ["Bet Marketplace", "Create Bet", "User History", "Chat"];
const pagesMap = new Map([
  ["Bet Marketplace", "bet-marketplace"],
  ["Create Bet", "create-bet"],
  ["User History", "user-history"],
  ["Chat", "chat"],
]);

const ResponsiveAppBar = () => {
  const [sepolia, setSepolia] = useState(false);
  const { isAuthenticated, account, connect, disconnect } = useWeb3();
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );

  useEffect(() => {
    checkSepolia();
  }, []);

  const checkSepolia = async () => {
    const provider = await detectEthereumProvider();
    const chainId = await web3.eth.getChainId();
    if (provider && Number(chainId) === 11155111) {
      setSepolia(true);
    }
  };

  const login = async () => {
    const provider = await detectEthereumProvider();
    const chainId = await web3.eth.getChainId();

    if (!provider) {
      alert(
        "This application requires MetaMask. Please install it in your browser"
      );
    } else if (Number(chainId) !== 11155111) {
      alert("Please switch to the Sepolia Network");
    } else {
      setSepolia(true);
      if (!isAuthenticated) {
        await connect();
      }
    }
  };

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar position="sticky">
      <Container style={{ backgroundColor: "primary.main" }} maxWidth="xl">
        <Toolbar disableGutters>
          <img
            src="https://i.imgur.com/uMoBVbS.png"
            alt="logo"
            style={{ height: "4.5%", width: "3%", padding: 0, margin: 0 }}
          />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 4,
              ml: 0,
              display: { xs: "none", md: "flex" },
              fontFamily: "Righteous",
              fontWeight: 300,
              fontSize: 30,
              color: "black",
              textDecoration: "none",
            }}
          >
            TeaLink
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              <MenuItem key={pages[0]} onClick={handleCloseNavMenu}>
                <Link
                  style={{ textDecoration: "none", color: "text.primary" }}
                  href={`/${pagesMap.get(pages[0])}`}
                >
                  <Typography textAlign="center" sx={{ color: "text.primary" }}>
                    {pages[0]}
                  </Typography>
                </Link>
              </MenuItem>

              {isAuthenticated && sepolia ? (
                <MenuItem key={pages[1]} onClick={handleCloseNavMenu}>
                  <Link
                    style={{ textDecoration: "none", color: "text.primary" }}
                    href={`/${pagesMap.get(pages[1])}`}
                  >
                    <Typography
                      textAlign="center"
                      sx={{ color: "text.primary" }}
                    >
                      {pages[1]}
                    </Typography>
                  </Link>
                </MenuItem>
              ) : (
                <MenuItem key={pages[1]} onClick={login}>
                  <Typography textAlign="center" sx={{ color: "text.primary" }}>
                    {pages[1]}
                  </Typography>
                </MenuItem>
              )}

              {isAuthenticated && sepolia ? (
                <MenuItem key={pages[2]} onClick={handleCloseNavMenu}>
                  <Link
                    style={{ textDecoration: "none", color: "text.primary" }}
                    href={`/${pagesMap.get(pages[2])}`}
                  >
                    <Typography
                      textAlign="center"
                      sx={{ color: "text.primary" }}
                    >
                      {pages[2]}
                    </Typography>
                  </Link>
                </MenuItem>
              ) : (
                <MenuItem key={pages[2]} onClick={login}>
                  <Typography textAlign="center" sx={{ color: "text.primary" }}>
                    {pages[2]}
                  </Typography>
                </MenuItem>
              )}

              <MenuItem key={pages[3]} onClick={handleCloseNavMenu}>
                <Link
                  style={{ textDecoration: "none", color: "text.primary" }}
                  href={`/${pagesMap.get(pages[3])}`}
                >
                  <Typography textAlign="center" sx={{ color: "text.primary" }}>
                    {pages[3]}
                  </Typography>
                </Link>
              </MenuItem>
            </Menu>
          </Box>

          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "Righteous",
              fontWeight: 300,
              color: "black",
              textDecoration: "none",
            }}
          >
            TeaLink
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            <Button
              key={pages[0]}
              onClick={handleCloseNavMenu}
              sx={{
                my: 2,
                color: "text.primary",
                display: "block",
                textTransform: "none",
              }}
            >
              <Link
                style={{ textDecoration: "none", color: "text.primary" }}
                href={`/${pagesMap.get(pages[0])}`}
              >
                <Typography textAlign="center" sx={{ color: "text.primary" }}>
                  {pages[0]}
                </Typography>
              </Link>
            </Button>

            {isAuthenticated && sepolia ? (
              <Button
                key={pages[1]}
                onClick={handleCloseNavMenu}
                sx={{
                  my: 2,
                  color: "text.primary",
                  display: "block",
                  textTransform: "none",
                }}
              >
                <Link
                  style={{ textDecoration: "none", color: "text.primary" }}
                  href={`/${pagesMap.get(pages[1])}`}
                >
                  <Typography textAlign="center" sx={{ color: "text.primary" }}>
                    {pages[1]}
                  </Typography>
                </Link>
              </Button>
            ) : (
              <Tooltip title="Sign In">
                <Button
                  key={pages[1]}
                  onClick={login}
                  sx={{
                    my: 2,
                    color: "text.primary",
                    display: "block",
                    textTransform: "none",
                  }}
                >
                  <Typography textAlign="center" sx={{ color: "text.primary" }}>
                    {pages[1]}
                  </Typography>
                </Button>
              </Tooltip>
            )}

            {isAuthenticated && sepolia ? (
              <Button
                key={pages[2]}
                onClick={handleCloseNavMenu}
                sx={{
                  my: 2,
                  color: "text.primary",
                  display: "block",
                  textTransform: "none",
                }}
              >
                <Link
                  style={{ textDecoration: "none", color: "text.primary" }}
                  href={`/${pagesMap.get(pages[2])}`}
                >
                  <Typography textAlign="center" sx={{ color: "text.primary" }}>
                    {pages[2]}
                  </Typography>
                </Link>
              </Button>
            ) : (
              <Tooltip title="Sign In">
                <Button
                  key={pages[2]}
                  onClick={login}
                  sx={{
                    my: 2,
                    color: "text.primary",
                    display: "block",
                    textTransform: "none",
                  }}
                >
                  <Typography textAlign="center" sx={{ color: "text.primary" }}>
                    {pages[2]}
                  </Typography>
                </Button>
              </Tooltip>
            )}

            <Button
              key={pages[3]}
              onClick={handleCloseNavMenu}
              sx={{
                my: 2,
                color: "text.primary",
                display: "block",
                textTransform: "none",
              }}
            >
              <Link
                style={{ textDecoration: "none", color: "text.primary" }}
                href={`/${pagesMap.get(pages[3])}`}
              >
                <Typography
                  textAlign="center"
                  sx={{
                    color: "text.primary",
                    fontFamily: "Poppins",
                  }}
                >
                  {pages[3]}
                </Typography>
              </Link>
            </Button>
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <Tooltip title="Sign Out">
                <IconButton
                  onClick={disconnect}
                  sx={{ p: 0, color: "text.primary" }}
                >
                  <Typography
                    style={{
                      textDecoration: "none",
                      color: "text.primary",
                      fontFamily: "Poppins",
                      fontSize: 14,
                      letterSpacing: 0.457,
                      padding: 10,
                    }}
                  >
                    {account
                      ? `${account.substring(0, 5)}...${account.substring(
                          38,
                          43
                        )}`
                      : ""}
                  </Typography>
                  <Avatar
                    alt="User Avatar"
                    src="https://i.imgur.com/EoSDNhZ.png"
                  />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Sign in with MetaMask">
                <IconButton
                  onClick={login}
                  sx={{ p: 0, color: "text.primary" }}
                >
                  <Typography
                    style={{
                      textDecoration: "none",
                      color: "text",
                      fontFamily: "Poppins",
                      fontSize: 16,
                      letterSpacing: 0.457,
                      padding: 10,
                    }}
                  >
                    Sign In
                  </Typography>
                  <Avatar
                    alt="MetaMask"
                    src="https://i.imgur.com/EoSDNhZ.png"
                  />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default ResponsiveAppBar;
