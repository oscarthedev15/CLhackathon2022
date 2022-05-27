import * as React from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import MenuIcon from '@mui/icons-material/Menu'
import Container from '@mui/material/Container'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import { Link } from 'react-router-dom'
import { useMoralis } from 'react-moralis'
import detectEthereumProvider from '@metamask/detect-provider'
import web3 from '../web3'

const pages = ['Bet Marketplace', 'Create Bet', 'Chat']
let pagesMap = new Map()
pagesMap.set(pages[0], 'BetMarketPlace')
pagesMap.set(pages[1], 'CreateBet')
pagesMap.set(pages[2], 'Chat')

let kovNetwork = false;


const ResponsiveAppBar = () => {
  const { authenticate, isAuthenticated, user, logout } = useMoralis()

 

  const login = async () => {
    const provider = await detectEthereumProvider();
    const chainId = await web3.eth.net.getId();
    if (!provider) {
      alert("This application requires Metamask.  Please install to your browser");
    } 
    else if (chainId !== 42){
      alert("Switch to Kovan Network")
    }
    else {
      kovNetwork = true;
      if (!isAuthenticated) {
        await authenticate({ signingMessage: 'Please Log In' })
          .then(function (user) {
            console.log('logged in user:', user)
            console.log(user!.get('ethAddress'))
          })
          .catch(function (error) {
            console.log(error)
          })
      }
    }
  }

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null)

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  return (
    <AppBar position="static">
      <Container style={{ backgroundColor: 'primary.main' }} maxWidth="xl">
        <Toolbar disableGutters>
          <img
            src="https://i.imgur.com/uMoBVbS.png"
            alt="logo"
            style={{ height: '6%', width: '4%' }}
          />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'Righteous',
              fontWeight: 300,
              fontSize: 30,
              // letterSpacing: '.3rem',
              color: 'black',
              textDecoration: 'none',
            }}
          >
            TeaLink
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
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
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              <MenuItem key={pages[0]} onClick={handleCloseNavMenu}>
                <Link
                  style={{ textDecoration: 'none', color: 'text.primary' }}
                  to={`/${pagesMap.get(pages[0])}`}
                >
                  <Typography textAlign="center" sx={{ color: 'text.primary' }}>
                    {pages[0]}
                  </Typography>
                </Link>
              </MenuItem>

              {isAuthenticated && kovNetwork ? (
                <MenuItem key={pages[1]} onClick={handleCloseNavMenu}>
                  <Link
                    style={{ textDecoration: 'none', color: 'text.primary' }}
                    to={`/${pagesMap.get(pages[1])}`}
                  >
                    <Typography
                      textAlign="center"
                      sx={{ color: 'text.primary' }}
                    </Typography>
                  </Link>
                </MenuItem>
              ) : (
                <MenuItem key={pages[1]} onClick={login}>
                  <Typography textAlign="center" sx={{ color: 'text.primary' }}>
                    {pages[1]}
                  </Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'Righteous',
              fontWeight: 300,
              // letterSpacing: '.3rem',
              color: 'black',
              textDecoration: 'none',
            }}
          >
            TeaLink
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button
              key={pages[0]}
              onClick={handleCloseNavMenu}
              sx={{
                my: 2,
                color: 'text.primary',
                display: 'block',
                textTransform: 'none',
              }}
            >
              <Link
                style={{ textDecoration: 'none', color: 'text.primary' }}
                to={`/${pagesMap.get(pages[0])}`}
              >
                <Typography textAlign="center" sx={{ color: 'text.primary' }}>
                  {pages[0]}
                </Typography>
              </Link>
            </Button>

            {isAuthenticated && kovNetwork ? (
              <Button
                key={pages[1]}
                onClick={handleCloseNavMenu}
                sx={{
                  my: 2,
                  color: 'text.primary',
                  display: 'block',
                  textTransform: 'none',
                }}
              >
                <Link
                  style={{ textDecoration: 'none', color: 'text.primary' }}
                  to={`/${pagesMap.get(pages[1])}`}
                >
                  <Typography textAlign="center" sx={{ color: 'text.primary' }}>
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
                    color: 'text.primary',
                    display: 'block',
                    textTransform: 'none',
                  }}
                >
                  <Typography textAlign="center" sx={{ color: 'text.primary' }}>
                    {pages[1]}
                  </Typography>
                </Button>
              </Tooltip>
            )}


            <Button
              key={pages[2]}
              onClick={handleCloseNavMenu}
              sx={{
                my: 2,
                color: 'text.primary',
                display: 'block',
                textTransform: 'none',
              }}
            >
              <Link
                style={{ textDecoration: 'none', color: 'text.primary' }}
                to={`/${pagesMap.get(pages[2])}`}
              >
                <Typography
                  textAlign="center"
                  sx={{
                    color: 'text.primary',
                    fontFamily: 'Poppins',
                  }}
                >
                  {pages[2]}
                </Typography>
              </Link>
            </Button>
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <Tooltip title="Sign Out">
                <IconButton
                  onClick={logout}
                  sx={{ p: 0, color: 'text.primary' }}
                >
                  <Typography
                    style={{
                      textDecoration: 'none',
                      color: 'text.primary',
                      fontFamily: 'Poppins',
                      fontSize: 14,
                      letterSpacing: 0.457,
                      padding: 10,
                    }}
                  >
                    {user!
                      .get('ethAddress')
                      .substring(0, 5)
                      .concat('...')
                      .concat(user!.get('ethAddress').substring(38, 43))}
                  </Typography>
                  <Avatar
                    alt="Remy Sharp"
                    src="https://i.imgur.com/EoSDNhZ.png"
                  />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Sign in with Metamask">
                <IconButton
                  onClick={login}
                  sx={{ p: 0, color: 'text.primary' }}
                >
                  <Typography
                    style={{
                      textDecoration: 'none',
                      color: 'text',
                      fontFamily: 'Poppins',
                      fontSize: 16,
                      letterSpacing: 0.457,
                      padding: 10,
                    }}
                  >
                    Sign In
                  </Typography>
                  <Avatar
                    alt="Remy Sharp"
                    src="https://i.imgur.com/EoSDNhZ.png"
                  />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default ResponsiveAppBar
