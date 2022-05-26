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
import AdbIcon from '@mui/icons-material/Adb'
import { Link } from 'react-router-dom'
import { useMoralis } from 'react-moralis';

const pages = ['Bet Marketplace', 'Create Bet', 'Chat']
let pagesMap = new Map();
pagesMap.set(pages[0], 'BetMarketPlace');
pagesMap.set(pages[1], 'CreateBet');
pagesMap.set(pages[2], 'Chat');

const ResponsiveAppBar = () => {

  const {
    authenticate,
    isAuthenticated,
    user,
    logout,
  } = useMoralis()

  const login = async () => {
    if (!isAuthenticated) {
      await authenticate({ signingMessage: 'Log in using Moralis' })
        .then(function (user) {
          console.log('logged in user:', user)
          console.log(user!.get('ethAddress'))
        })
        .catch(function (error) {
          console.log(error)
        })
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
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
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
                  <Typography textAlign="center">
                    <Link
                      style={{ textDecoration: 'none', color: 'black' }}
                      to={`/${pagesMap.get(pages[0])}`}
                    >
                      {pages[0]}
                    </Link>
                  </Typography>
                </MenuItem>

                {isAuthenticated ? (
                  <MenuItem key={pages[1]} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">
                    <Link
                      style={{ textDecoration: 'none', color: 'black' }}
                      to={`/${pagesMap.get(pages[1])}`}
                    >
                      {pages[1]}
                    </Link>
                  </Typography>
                </MenuItem>
                ) : (
                  <MenuItem key={pages[1]} onClick={login}>
                  <Typography textAlign="center">
                      {pages[1]}
                  </Typography>
                </MenuItem>
                )}
                
          
            </Menu>
          </Box>
          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Home
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
          
              <Button
                key={pages[0]}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                <Link
                  style={{ textDecoration: 'none', color: 'white' }}
                  to={`/${pagesMap.get(pages[0])}`}
                >
                  {pages[0]}
                </Link>
              </Button>
           
              {isAuthenticated ? (
                
                <Button
                key={pages[1]}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                <Link
                  style={{ textDecoration: 'none', color: 'white' }}
                  to={`/${pagesMap.get(pages[1])}`}
                >
                  {pages[1]}
                </Link>
              </Button>
            
              ) : (
                <Tooltip title="Sign In">
                <Button
                key={pages[1]}
                onClick={login}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                  {pages[1]}
              </Button>
              </Tooltip>
              )}

              <Button
                key={pages[2]}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                <Link
                  style={{ textDecoration: 'none', color: 'white' }}
                  to={`/${pagesMap.get(pages[2])}`}
                >
                  {pages[2]}
                </Link>
              </Button>
          
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            { isAuthenticated ? (
              <Tooltip title="Sign Out">
              <IconButton onClick={logout} sx={{ p: 0 }} >
              <p style={{ textDecoration: 'none', color: 'white' , fontFamily: 'roboto', fontWeight: 500, fontSize: 14, letterSpacing: 0.457, padding: 10 }}>
                {user!.get('ethAddress').substring(0, 5).concat("...").concat(user!.get('ethAddress').substring(38, 43))}
              </p>
                <Avatar alt="Remy Sharp" src="https://i.imgur.com/EoSDNhZ.png" />
              </IconButton>
            </Tooltip>
            ) : (
              <Tooltip title="Sign in with Metamask">
              <IconButton onClick={login} sx={{ p: 0 }} >
              <p style={{ textDecoration: 'none', color: 'white' , fontFamily: 'roboto', fontWeight: 500, fontSize: 14, letterSpacing: 0.457, padding: 10 }}>
                LOGIN
              </p>
                <Avatar alt="Remy Sharp" src="https://i.imgur.com/EoSDNhZ.png" />
              </IconButton>
            </Tooltip>
            )
            }
    
          </Box>

          
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default ResponsiveAppBar

