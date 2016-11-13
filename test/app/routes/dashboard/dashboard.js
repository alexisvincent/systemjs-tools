import React, { Component } from "react"
// import _ from 'lodash'
// import styles from './dashboard.pcss'

export default
class DashboardContainer extends React.Component {

	constructor() {
		super()
		this.state = {
			test: "lol"
		}
		console.log("sdf")
	}

	render() {
		return (
			<div /**className={styles.dashboard}**/>
				<p onClick={() => this.setState({test: "hahahaha"})} /**className={styles.header}**/>Welcome to the admin area! {this.state.test}</p>
				<p>It's so as good to see you're doing some work today. Keep it up!</p>
			</div>
		)
	}
}
