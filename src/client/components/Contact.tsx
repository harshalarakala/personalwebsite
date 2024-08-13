import React, { useState, useEffect } from 'react';
import emailjs from 'emailjs-com';
import { ToastContainer, toast } from 'react-toastify';
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

  useEffect(() => {
    const icons = document.querySelectorAll('.falling-img');
    icons.forEach(icon => {
      const randomPosition = Math.random();
      const randomDuration = Math.random();
      (icon as HTMLElement).style.setProperty('--random-position', randomPosition.toString());
      (icon as HTMLElement).style.setProperty('--random-duration', randomDuration.toString());
    });
  }, []);

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
    <div className="relative">
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
      <div className="max-w-md mx-auto mt-10 p-4 border border-gray-300 shadow-md rounded-lg bg-slate-200 z-40">
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
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full p-2 mt-2 text-white rounded-md ${isSubmitting ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Submit'}
          </button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Contact;