import React, { useEffect } from 'react';
import './achievements.css';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';

interface AchievementsProps {
	data: {
		hasPlayed: boolean;
		hasWon: boolean;
		hasFriend: boolean;
	};
  }

const Achievements = (props: AchievementsProps) => {
	const {data} = props;

	return (
		<div className='Achievements'>
				<div className='Achiev_list'>
						<div className="tooltip">
							
							{ !data.hasPlayed ? (
									<img className='Achiev_image_disabled' src='/sharingan.png' alt='Achiev'/>
								) : (
									<img className='Achiev_image_enabled' src='/sharingan.png' alt='Achiev'/>
								)
							}

							{ !data.hasPlayed ? (
								<span className="tooltiptext_disabled">1st Game</span>
								) : (
								<span className="tooltiptext_enabled">1st Game</span>
								)
							}

						</div>
						<div className="tooltip">

							{ !data.hasWon ? (
									<img className='Achiev_image_disabled' src='/rinnegan.png' alt='Achiev'/>
								) : (
									<img className='Achiev_image_enabled' src='/rinnegan.png' alt='Achiev'/>
								)
							}

							{ !data.hasWon ? (
									<span className="tooltiptext_disabled">1st Win</span>
								) : (
									<span className="tooltiptext_enabled">1st Win</span>
								)
							}

						</div>
						<div className="tooltip">

							{ !data.hasFriend ? (
									<img className='Achiev_image_disabled' src='/Mangekyou.png' alt='Achiev'/>
								) : (
									<img className='Achiev_image_enabled' src='/Mangekyou.png' alt='Achiev'/>
								)
							}

							{ !data.hasFriend ? (
									<span className="tooltiptext_disabled">1st Friend</span>
								) : (
									<span className="tooltiptext_enabled">1st Friend</span>
								)
							}
						
						</div>
				</div>
		</div>
	)
};

export default Achievements;