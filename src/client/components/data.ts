// data.ts
import costarMedia from '../images/costar.png';
import acentleMedia from '../images/acentleMedia.jpg';
import mathnasiumMedia from '../images/mathnasiumMedia.png';
import funlandMedia from '../images/funlandMedia.jpg';
import vaMotorsportMedia from '../images/vaMotorsportMedia.jpg';
import ftcMedia from '../images/ftcMedia.png';

export interface Experience {
  type: 'experience';
  title: string;
  duration: string;
  summary: string;
  briefDescription: string;
  fullDescription: string;
  media: string;
}

export interface Project {
  type: 'project';
  title: string;
  description: string;
  fullDescription: string;
  media: string;
}

export const experiences: Experience[] = [
  {
    type: 'experience',
    title: 'Fullstack ML Intern, Costar Group, Richmond, VA',
    duration: 'Jun 2024 — Aug 2024',
    summary:
      'Developed a machine learning data syncing system and an executive dashboard.',
    briefDescription:
      'At Costar Group, I developed a machine learning system to optimize data syncing and created an executive dashboard. I utilized React, Node.js, and C# to build a seamless user interface and robust backend. By leveraging AWS SQS and ElasticSearch, I improved query speeds and reduced database load. My work contributed to streamlining business operations and enhancing decision-making for executives.',
    fullDescription: `My summer at Costar Group was an incredible journey of both technical growth and personal development. Working as a Fullstack ML Intern, I had the opportunity to dive into a high-energy, fast-paced work environment that truly valued innovation, creativity, and collaboration.

### Project Scope & Responsibilities

One of the key projects I worked on was a data syncing machine learning system that would intelligently manage large datasets and prioritize them based on predicted usage. Using React.tsx and TailwindCSS, I built a user interface that was clean, responsive, and easy to navigate, while also working with Node.js and C# to create a robust back-end solution. I learned the importance of crafting a seamless user experience by closely collaborating with front-end designers and back-end developers to ensure all components were cohesive.

### Advanced Technologies & Solutions

My time at Costar Group allowed me to explore advanced technologies like AWS SQS queues and ElasticSearch, and to integrate machine learning models using Llama to intelligently optimize data backups for faster query results. It was fascinating to witness how AI could enhance the efficiency of even the most routine data processes. This led to tangible results: reduced load on the company’s enterprise database and improved query speeds, which played a direct role in making business operations smoother.

### Impact & Business Value

The solutions I worked on weren’t just about writing code — they were about providing meaningful value that would help Costar’s executive teams make more informed decisions. By optimizing data synchronization and leveraging machine learning, I was able to contribute to projects that directly enhanced the efficiency and decision-making capabilities of the company’s leadership.

### What I Liked

The culture of teamwork and mentorship stood out the most during my time at Costar. I had the privilege of working alongside some truly amazing mentors, whose expertise and patience played a huge role in my learning curve. The brainstorming sessions, where everyone’s input mattered, from interns to senior developers, made every project feel more like a collective effort rather than a solo mission.

### What I Learned

I learned that technology is only one part of the equation; the people and how we collaborate together are what truly make great products come to life. Working on a machine learning system from end to end gave me a deep understanding of fullstack development, data management, and the practical applications of machine learning in a business context.

### Personal Growth

This experience taught me invaluable lessons about the intersection of technology and business strategy. I developed a greater appreciation for scalable solutions and how technology can directly impact business outcomes. I also gained confidence in my ability to tackle complex projects, lead initiatives, and communicate effectively across different teams and departments.
`,
    media: costarMedia,
  },
  {
    type: 'experience',
    title: 'Software Developer Intern, Acentle, Herndon, VA',
    duration: 'Jun 2022 — May 2023',
    summary:
      'Advanced my web development skills and developed internal software tools.',
    briefDescription:
      'At Acentle, I enhanced my web development skills by building internal software tools, including a system for monitoring government contract bidding. I worked with React, Angular, and Java to ensure high scalability and reliability. This tool significantly reduced the time needed for bid analysis and increased contract wins. My contributions provided valuable insights for clients and boosted team productivity.',
    fullDescription: `At Acentle, a consulting company that prides itself on delivering custom software solutions, my year-long journey as a Software Developer Intern was nothing short of transformative. During my tenure, I was introduced to a wide range of technologies and methodologies, but what stood out most was how the company prioritized learning, adaptability, and delivering value to clients.

### Consulting World & Client Interaction

The consulting world is a unique beast; every client has different needs, and as a developer, you have to be ready to pivot, learn, and execute. My time at Acentle allowed me to experience this firsthand. I was actively involved in client meetings, which helped me understand the nuances of how software requirements are gathered, and more importantly, how they evolve over time. It was exhilarating to meet clients from different industries, all facing distinct challenges, and to witness how the solutions we developed transformed their workflows and increased their productivity.

### Project Scope & Key Contributions

One of my major projects at Acentle was developing an internal software tool that would monitor government contract bidding opportunities. This system was designed from scratch, starting with a bare-bones proof of concept and eventually growing into a full-featured, highly scalable application. I worked extensively with HTML, CSS, JavaScript, and frameworks like React.js and Angular to make sure our user interface was intuitive and user-friendly. Additionally, I learned how to build Java-based backend services that handled thousands of user interactions each day without a hitch.

### Technical Versatility & Solutions

The tech stack at Acentle was often client-specific, and I grew to appreciate the importance of being a tech-agnostic developer — someone who understands the core principles of software engineering and can apply them regardless of the language or framework in use. By working on different projects, I was able to see firsthand how technologies like React, Angular, and Java could be used harmoniously to create comprehensive software solutions that were reliable, secure, and easy to maintain.

### Impact & Business Value

What I found particularly rewarding was seeing how our software made life easier for both our clients and the internal Acentle team. The contract bidding monitoring system, for example, significantly reduced the time and effort needed for bid analysis, which directly led to more successful contract wins for the company. Being part of this success story made me realize how impactful software development can be when approached with the right mindset and tools.

### What I Liked

I loved the dynamic environment at Acentle. The variety of projects meant that no two days were the same, and I was constantly learning something new. I particularly enjoyed the collaborative atmosphere, where developers, designers, and project managers all worked closely to ensure the client’s vision was brought to life.

### What I Learned

In a consulting environment, understanding both the client’s perspective and the underlying technology is crucial. The lessons I learned at Acentle about client communication, adaptability, and strategic thinking are things I carry with me in every role I take on, and they’ve made me not only a better developer but also a better problem solver overall.

### Personal Growth

Working at Acentle taught me the value of adaptability — both in terms of technology and communication. I became more confident in client interactions, learned how to manage changing requirements effectively, and developed a tech-agnostic approach to problem-solving. These skills have continued to benefit me in all my subsequent projects and roles.
`,
    media: acentleMedia,
  },
  {
    type: 'experience',
    title: 'Board Member, Virginia Motorsport',
    duration: 'Aug 2022 — Present',
    summary: 'Managed financial operations and fundraising for car building and racing projects at UVA’s motorsport club.',
    briefDescription: 'At Virginia Motorsport, I managed the club’s finances, optimizing resource allocation for car construction and racing competitions. I secured sponsorships and handled budgeting to ensure project success. My contributions supported the club in building and maintaining competitive race cars while enhancing financial reporting and fundraising efforts. Our team successfully competed in several track racing events, representing UVA with pride.',
    fullDescription: `### Role & Responsibilities

As a Board Member of Virginia Motorsport, I was responsible for overseeing the financial operations and sponsorship efforts for the club. I collaborated with team leads to ensure effective budget management for car building projects and competitive racing events. My role involved securing external sponsorships and managing fundraising efforts, which were crucial to the club's success.

### Financial Strategy & Sponsorship

I developed financial strategies that maximized our resources for constructing competitive race cars. This included working closely with sponsors, preparing financial reports, and managing expenses. Through these efforts, we were able to build cars that performed exceptionally well in national-level competitions.

### Team Leadership & Achievements

In addition to managing finances, I contributed to the overall leadership of the team by helping to organize track events and competitive races. Our team successfully competed in several Formula SAE events, gaining recognition for both our engineering and racing achievements.

### What I Gained

This experience helped me hone my financial management skills and develop a keen understanding of fundraising and sponsorship management. It also reinforced my ability to work under tight deadlines and contribute to a high-performance team in a fast-paced, competitive environment.`,
    media: vaMotorsportMedia
  },
  {
    type: 'experience',
    title: 'Co-Founder, Robotic Advancement for Youth (RAY)',
    duration: 'Aug 2021 — Present',
    summary: 'Co-founded a non-profit organization to promote robotics education for youth and organized hands-on robotics summer camps.',
    briefDescription: 'I co-founded Robotic Advancement for Youth, a non-profit dedicated to empowering students through hands-on robotics education. I developed and led summer camps, teaching coding and robotics skills. Additionally, I organized mock tournaments for FIRST Lego League (FLL) and FIRST Tech Challenge (FTC), providing students with practical experience in robotics competitions.',
    fullDescription: `### Role & Responsibilities

As the co-founder of Robotic Advancement for Youth, I led initiatives to introduce students to robotics and coding through summer camps and workshops. My main responsibilities included curriculum development, outreach to schools, and organizing events that promoted STEM education among young learners.

### Robotics Summer Camps & Workshops

One of our primary initiatives was to host robotics summer camps where students were taught foundational coding and robotics skills. I developed a curriculum that covered both hardware and software aspects of robotics, making learning fun and interactive for participants. These camps attracted over 300 attendees annually, with many students returning for multiple sessions.

### Mock Tournaments & Competitions

I organized mock robotics tournaments for FIRST Lego League (FLL) and FIRST Tech Challenge (FTC), providing students with hands-on competition experience. These events helped students prepare for official competitions by simulating real-world challenges and teaching teamwork, problem-solving, and engineering skills.

### Impact & Personal Growth

Through this role, I was able to empower hundreds of students with the tools they need to pursue their interests in robotics and STEM. It was incredibly rewarding to see young learners gain confidence and develop a passion for technology. My leadership in this non-profit also helped me develop organizational and project management skills, as well as the ability to mentor and guide students in their educational journeys.`,
    media: ftcMedia
  },
  {
    type: 'experience',
    title: 'Math Tutor, Mathnasium of Herndon',
    duration: 'Jan 2020 — Aug 2021',
    summary: 'Tutored students in mathematics from elementary through high school levels, focusing on personalized learning plans.',
    briefDescription: 'At Mathnasium, I provided personalized tutoring to students in elementary through high school math. I tailored learning plans to fit the needs of each student, ensuring they mastered key math concepts. By building strong relationships with students, I helped them build confidence and improve their math skills, leading to higher academic performance.',
    fullDescription: `### Role & Responsibilities

At Mathnasium, I worked as a math tutor, providing individualized instruction to students ranging from elementary to high school. I focused on personalized learning plans, tailored to each student's abilities and learning pace, to ensure they could grasp key mathematical concepts.

### Personalized Learning Plans

I assessed each student's strengths and areas for improvement, creating customized lesson plans that addressed their specific needs. By working on foundational skills as well as advanced topics, I helped students gain confidence and achieve academic success in subjects ranging from basic arithmetic to algebra and geometry.

### Building Confidence in Math

My approach emphasized making math approachable and enjoyable. I built strong relationships with students and worked to overcome their anxieties around math. Many of my students not only improved their grades but also developed a positive attitude toward learning math.

### Impact & Lessons Learned

This tutoring role taught me how to break down complex concepts into simple, digestible lessons. I also learned the importance of patience, adaptability, and clear communication when working with students who have different learning styles.`,
    media: mathnasiumMedia
  },
  {
    type: 'experience',
    title: 'Customer Service Associate, Funland of Fairfax',
    duration: 'Jun 2019 — Dec 2019',
    summary: 'Provided exceptional customer service, assisting guests with arcade games and events at Funland of Fairfax.',
    briefDescription: 'As a Customer Service Associate at Funland, I assisted guests with arcade games, event planning, and general inquiries. I ensured a positive guest experience by providing excellent service and resolving customer issues quickly. My role allowed me to develop strong communication skills and gain experience working in a fast-paced, customer-facing environment.',
    fullDescription: `### Role & Responsibilities

As a Customer Service Associate at Funland of Fairfax, I was responsible for assisting guests with arcade games, event planning, and resolving inquiries. My primary focus was ensuring guests had a fun and enjoyable experience while maintaining the smooth operation of events and activities.

### Guest Interaction & Problem-Solving

I provided guests with guidance on how to play arcade games and addressed any technical issues they encountered. I also assisted in planning and coordinating events, such as birthday parties and group bookings. I frequently communicated with guests to ensure their experience was seamless, resolving any issues quickly and efficiently.

### Customer Service Excellence

I took pride in delivering excellent customer service and ensuring that every guest left with a positive impression of Funland. By maintaining a friendly and helpful attitude, I contributed to repeat business and high customer satisfaction.

### Personal Development

This role helped me develop strong interpersonal and communication skills, particularly in high-pressure situations. I gained valuable experience in customer service, learning how to manage guest relations and work effectively in a fast-paced, dynamic environment.`,
    media: funlandMedia
  }
];

export const projects: Project[] = [
  {
    type: 'project',
    title: 'AI Chatbot Development',
    description:
      'Developed an AI chatbot to streamline customer service operations for a retail company.',
    fullDescription: `In this project, I developed an AI chatbot using Python and TensorFlow to help streamline customer service operations. The chatbot uses NLP models to understand and respond to customer queries. Integrated with the company's CRM, the chatbot significantly reduced response time and improved customer satisfaction rates. I also implemented a feedback loop that continuously improved the chatbot's performance based on real customer interactions.`,
    media: costarMedia, // Replace with appropriate media
  },
  {
    type: 'project',
    title: 'Data Visualization Dashboard',
    description:
      'Built a comprehensive data visualization dashboard using React and D3.js.',
    fullDescription: `For this project, I created a real-time data visualization dashboard using React and D3.js. The dashboard displayed complex data sets in a user-friendly format, allowing users to filter, zoom, and interact with charts. By implementing real-time updates via WebSockets, users could track the status of the data at any given time. The project helped executives gain insights quickly and make data-driven decisions.`,
    media: acentleMedia, // Replace with appropriate media
  },
];
