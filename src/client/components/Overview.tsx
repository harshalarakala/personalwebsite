import { Fab } from '@mui/material';
import React from 'react';
import contactImage from '../images/contact.png';

const Overview: React.FC = () => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <div className='h-screen w-screen flex flex-col justify-between items-center'>
            <div>
                <h2 className="text-2xl font-bold mb-4">Overview</h2>
                <p>
                    Welcome to my personal website! Here you can find an overview of who I am, my journey, and what I do.
                    I'm passionate about technology, and I love creating solutions that make a difference.
                </p>
            </div>
            <Fab
                style={{
                    position: 'fixed',
                    bottom: '32px',
                    right: '32px',
                    width: '150px',
                    height: '60px',
                    textEmphasis: 'bold',
                    fontFamily: 'Nunito Sans',
                    fontSize: '1.25rem',
                }}
                variant='extended'
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {isHovered ? (
                    <img className='w-[50px]' src={contactImage} alt='fail' />
                ) : (
                    'CONTACT'
                )}
            </Fab>
        </div>
    );
};

export default Overview;
