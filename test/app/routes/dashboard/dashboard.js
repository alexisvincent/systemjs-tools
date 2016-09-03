import React, { Component } from "react"
import _ from 'lodash'
// import styles from './dashboard.ncss'

export default
class DashboardContainer extends React.Component {
	render() {
		return (
			<div /**className={styles.dashboard}**/>
				<p /**className={styles.header}**/>Welcome to the admin area!</p>
				<p>It's so nice to see you're doin some work today. Keep it up!</p>
			</div>
		)
	}
}
