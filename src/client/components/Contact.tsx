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
      <div className="max-w-md mx-auto p-5 sm:p-6 border border-gray-200 shadow-sm rounded-xl bg-white z-40">
        <p className="mb-6 text-gray-700 text-sm">
          I'd love to hear from you! Whether you have a question, want to collaborate on a project, or just want to say what's up, feel free to reach out.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Name:</label>
            <input
              type="text"
              id="name"
              className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email:</label>
            <input
              type="email"
              id="email"
              className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">Message:</label>
            <textarea
              id="message"
              className="w-full h-[200px] p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors shadow-sm ${
              isSubmitting 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Submit'}
          </button>
        </form>
        <button
            onClick={handleSendText}
          className="w-full mt-3 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          Send Text
        </button>
        <div className="flex justify-between gap-3 mt-4">
          {/* GitHub Icon Card */}
          <a
            href="https://github.com/harshalarakala"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 p-4 border border-gray-200 rounded-xl bg-white flex justify-center items-center hover:bg-gray-50 shadow-sm hover:shadow-md transition-colors duration-200 group"
          >
            <img src={github} alt="GitHub" className="h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
          </a>

          {/* LinkedIn Icon Card */}
          <a
            href="https://linkedin.com/in/harshalarakala"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 p-4 border border-gray-200 rounded-xl bg-white flex justify-center items-center hover:bg-gray-50 shadow-sm hover:shadow-md transition-colors duration-200 group"
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
        className="m-auto max-w-sm p-6 bg-white rounded-xl border border-gray-200 shadow-2xl"
        overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Send Text Message</h2>
        <p className="text-gray-700 mb-6">How would you like to proceed?</p>
        <div className="flex gap-3">
          <button
            onClick={handleCopyToClipboard}
            className="flex-1 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Copy to Clipboard
          </button>
          <button
            onClick={handleOpenMessages}
            className="flex-1 inline-flex items-center justify-center rounded-md bg-green-600 hover:bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors shadow-sm"
          >
            Open iMessage
          </button>
        </div>
      </Modal>
    </div>
  );
}  

export default Contact;