import React, { useState, useEffect } from 'react';
import emailjs from 'emailjs-com';
import { ToastContainer, toast } from 'react-toastify';
import Modal from 'react-modal';
import 'react-toastify/dist/ReactToastify.css';
import '../css/FallingAnimation.css';
import phone from '../images/phone.png';
import emailPng from '../images/email.png';
import messages from '../images/messages.png';
import github from '../images/github.png';
import linkedIn from '../images/linkedin.png';
import instagram from '../images/insta.png';

const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    const icons = document.querySelectorAll('.falling-img');
  
    icons.forEach((icon) => {
      const updateRandomValues = () => {
        const randomPosition = Math.random();
        const randomDuration = Math.random();
        (icon as HTMLElement).style.setProperty('--random-position', randomPosition.toString());
        (icon as HTMLElement).style.setProperty('--random-duration', randomDuration.toString());
      };
  
      // Add event listener to rerandomize after each animation ends
      icon.addEventListener('animationend', updateRandomValues);
  
      // Initialize the random values for the first fall
      updateRandomValues();
    });
  
    return () => {
      // Clean up the event listeners
      icons.forEach((icon) => {
        icon.removeEventListener('animationend', () => {});
      });
    };
  }, []);  

  const handleSendText = () => {
    const phoneNumber = '571-778-9224';

    // Detect the user's OS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMac = userAgent.includes('mac');
    const isWindows = userAgent.includes('win');

    if (isMac) {
      setModalIsOpen(true); // Open modal for macOS users
    } else if (isWindows) {
      // Copy the phone number to the clipboard for Windows users
      navigator.clipboard.writeText(phoneNumber)
        .then(() => {
          toast.success('Phone number copied to clipboard!');
        })
        .catch((error) => {
          console.error('Failed to copy phone number:', error);
          toast.error('Failed to copy phone number.');
        });
    } else {
      // Fallback: Copy the phone number to the clipboard for other systems
      navigator.clipboard.writeText(phoneNumber)
        .then(() => {
          toast.success('Phone number copied to clipboard!');
        })
        .catch((error) => {
          console.error('Failed to copy phone number:', error);
          toast.error('Failed to copy phone number.');
        });
    }
  };

  const handleCopyToClipboard = () => {
    const phoneNumber = '571-778-9224';
    navigator.clipboard.writeText(phoneNumber)
      .then(() => {
        toast.success('Phone number copied to clipboard!');
      })
      .catch((error) => {
        console.error('Failed to copy phone number:', error);
        toast.error('Failed to copy phone number.');
      });
    setModalIsOpen(false);
  };

  const handleOpenMessages = () => {
    const phoneNumber = '571-778-9224';
    const messageText = `Hi! I'd like to get in touch with you.`;
    window.location.href = `sms:${phoneNumber}&body=${encodeURIComponent(messageText)}`;
    toast.success('Opening iMessage...');
    setModalIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    const templateParams = {
      from_name: name,
      message: message,
      reply_to: email,
    };

    try {
      await emailjs.send(
        'service_agvp2sz',
        'template_b0trd35',
        templateParams,
        'eq_7G2CPHOva33sEn'
      );
      toast.success('Email sent successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('Failed to send email.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setIsSubmitting(false);
      setName('');
      setEmail('');
      setMessage('');
    }
  };

  return (
    <div className="relative py-8 w-full h-full flex items-center justify-center">
      {/* Falling Animation Background */}
      <div className="falling-container blur-sm -z-50">
        {Array.from({ length: 1 }).map((_, i) => (
          <React.Fragment key={i}>
            <img src={phone} alt="" className="falling-img" />
            <img src={messages} alt="" className="falling-img" />
            <img src={emailPng} alt="" className="falling-img" />
            <img src={github} alt="" className="falling-img" />
            <img src={linkedIn} alt="" className="falling-img" />
            <img src={instagram} alt="" className="falling-img" />
          </React.Fragment>
        ))}
      </div>
  
      {/* Contact Form */}
      <div className="max-w-md mx-auto p-4 border border-gray-300 shadow-md rounded-lg bg-slate-200 z-40">
        <p className="mb-4">
          I'd love to hear from you! Whether you have a question, want to collaborate on a project, or just want to say what's up, feel free to reach out.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</label>
            <input
              type="text"
              id="name"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
            <input
              type="email"
              id="email"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message:</label>
            <textarea
              id="message"
              className="mt-1 h-[200px] p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full p-2 mt-2 text-white rounded-md ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-900'}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Submit'}
          </button>
        </form>
        <button
            onClick={handleSendText}
          className="w-full p-2 mt-4 text-white bg-green-600 hover:bg-green-900 rounded-md"
        >
          Send Text
        </button>
        <div className="flex justify-between mt-4 ">
          {/* GitHub Icon Card */}
          <a
            href="https://github.com/harshalarakala"
            target="_blank"
            rel="noopener noreferrer"
            className="w-1/2 p-4 border border-gray-300 shadow-md rounded-lg bg-white flex justify-center items-center mr-2 hover:bg-gray-600 transition-colors duration-300 group"
          >
            <img src={github} alt="GitHub" className="h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
          </a>

          {/* LinkedIn Icon Card */}
          <a
            href="https://linkedin.com/in/harshalarakala"
            target="_blank"
            rel="noopener noreferrer"
            className="w-1/2 p-4 border border-gray-300 shadow-md rounded-lg bg-white flex justify-center items-center ml-2 hover:bg-gray-600 transition-colors duration-300 group"
          >
            <img src={linkedIn} alt="LinkedIn" className="h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
          </a>
        </div>
  
        <ToastContainer />
      </div>
  
      {/* Text Message Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Contact Options"
        className="m-auto max-w-sm p-6 bg-white rounded-md shadow-lg"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      >
        <h2 className="text-xl font-bold mb-4">Send Text Message</h2>
        <p>How would you like to proceed?</p>
        <div className="flex justify-between mt-6">
          <button
            onClick={handleCopyToClipboard}
            className="w-1/2 p-2 bg-blue-500 text-white rounded-md mr-2"
          >
            Copy to Clipboard
          </button>
          <button
            onClick={handleOpenMessages}
            className="w-1/2 p-2 bg-blue-500 text-white rounded-md ml-2"
          >
            Open iMessage
          </button>
        </div>
      </Modal>
    </div>
  );
}  

export default Contact;