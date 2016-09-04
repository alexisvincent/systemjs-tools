// Import React
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'

import styles from './index.pcss'

export default
class Index extends Component {
	render() {
		return (
			<div className={styles.index}>
				<div /**className={styles.page}**/>
					<div /**className={styles.content}**/>
						{this.props.children}
					</div>
				</div>
			</div>
		)
	}
}
