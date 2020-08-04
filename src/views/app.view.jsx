import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import InitView from './auth/old/init-view'
import ActionView from './activity/old/action-view'
import Layout from './shared/layout/layout.view'
import routes from '../routing/routes'
import { fetchTokens } from '../store/global/global.thunks'

function App ({ onLoadTokens }) {
  React.useEffect(() => {
    onLoadTokens()
  }, [onLoadTokens])

  return (
    <BrowserRouter>
      <Switch>
        <Route path='/old/:path?' exact>
          <Switch>
            <Route
              exact
              path='/old'
              component={InitView}
            />
            <Route
              exact
              path='/old/actions'
              component={ActionView}
            />
          </Switch>
        </Route>
        <Route>
          <Layout>
            <Switch>
              {routes.map(route =>
                <Route
                  exact
                  key={route.path}
                  path={route.path}
                  component={route.component}
                />
              )}
            </Switch>
          </Layout>
        </Route>
      </Switch>
    </BrowserRouter>
  )
}

App.propTypes = {
  onLoadTokens: PropTypes.func.isRequired
}

const mapDispatchToProps = (dispatch) => ({
  onLoadTokens: () => dispatch(fetchTokens())
})

export default connect(undefined, mapDispatchToProps)(App)
