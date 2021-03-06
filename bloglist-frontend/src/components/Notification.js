import React from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'

class Notification extends React.Component
{
  render() 
  {
    if (this.props.notification === null || this.props.notification.message === null ||this.props.notification === undefined) {
      return null
    }

    return (
      <div className={this.props.notification.style}>
        {this.props.notification.message}
      </div>
    )
  }
}

Notification.propTypes = {
  notification: PropTypes.object.isRequired
}

export default connect(
  (a) => { return {notification:a.notification} },
  null
)(Notification)
