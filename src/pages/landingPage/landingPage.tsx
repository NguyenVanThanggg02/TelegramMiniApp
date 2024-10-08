import React from 'react';
import '../../../style1.css'; 
import logo from '../../.../../../assets/static-page/logo.svg';
import lineCurve from '../../../assets/static-page/line-curve.svg';
import womanHoldingTablet from '../../../assets/static-page/women-holding-table.png';
import drImage from '../../../assets/static-page/dr-image.svg';
import waitstaffImage from '../../../assets/static-page/women-comment.svg';
import dinersImage from '../../../assets/static-page/women-cake.svg';
import benefitImage from '../../../assets/static-page/benefit-section-image.svg';
import downloadIcon from '../../../assets/static-page/Iconly/download-icon.svg';
import handleOverloadIcon from '../../../assets/static-page/Iconly/add-user-icon.svg';
import minimizeIcon from '../../../assets/static-page/Iconly/minimize-icon.svg';
import phoneImage1 from '../../../assets/static-page/iPhone-13-Pro-first.svg';
import phoneImage2 from '../../../assets/static-page/iPhone-13-Pro-multi-lang.svg';
import phoneImage3 from '../../../assets/static-page/iPhone-13-Pro-order-online.svg';
import phoneImage4 from '../../../assets/static-page/iPhone-13-Pro-full-func.svg';
import phoneImage5 from '../../../assets/static-page/marketing-optimization.svg';
import phoneImage6 from '../../../assets/static-page/instant-payment.svg';
import avatar1 from '../../../assets/static-page/avt1.svg';
import avatar2 from '../../../assets/static-page/avt2.svg';
import avatar3 from '../../../assets/static-page/avt3.svg';
import avatar4 from '../../../assets/static-page/avt4.svg';

const landingPage: React.FC = () => {
    return (
        <div>
            <header>
                <img src={logo} alt="logo" />
                <ul>
                    <li><a className="home">Home</a></li>
                    <li><a href="#">Press Kit</a></li>
                </ul>
                <a href="#" className="demo-btn">Demo</a>
            </header>

            <section className="hero">
                <div className="content">
                    <h1>Elevate Your Dining Experience with Digital Menus</h1>
                    <img src={lineCurve} alt="" />
                    <p style={{ paddingTop: '20px' }}>
                        Say goodbye to outdated paper menus and hello to Menu Master – the ultimate digital menu solution for
                        modern restaurants. Seamlessly integrated with Telegram, Menu Master changes the way your customers
                        order, making dining a faster, safer, and more enjoyable experience.
                    </p>

                    <div className="buttons">
                        <button className="button">Free Trial</button>
                        <button className="icon-button">
                            <img src="../../../assets/static-page/Iconly/Light/Play.png" alt="Play Icon" className="icon" />
                            View Demo
                        </button>
                    </div>
                </div>
                <div className="image-container">
                    <img src={womanHoldingTablet} alt="Woman holding tablet" />
                </div>
            </section>

            <section className="features">
                <h2>Designed for Everyone</h2>
                <p>What Menu Master can offer...</p>
                <div className="cards-container">
                    <div className="card">
                        <img src={drImage} alt="Restaurant Owner" />
                        <div className="card-content">
                            <h3>Restaurant Owners</h3>
                            <p>'Mobile first' is the key. Manage your store directly from your phone without needing a
                                memory-heavy app, boosting productivity and ensuring you stay updated from anywhere.</p>
                        </div>
                    </div>
                    <div className="card">
                        <img src={waitstaffImage} alt="Waitstaff" />
                        <div className="card-content">
                            <h3>Waitstaff</h3>
                            <p>No more running to each table and taking inefficient paper notes. With a dedicated interface,
                                they can easily manage orders, modifications, and cancellations, ensuring smooth customer
                                support.</p>
                        </div>
                    </div>
                    <div className="card">
                        <img src={dinersImage} alt="Diners" />
                        <div className="card-content">
                            <h3>Diners</h3>
                            <p>No need to download third-party apps or navigate to other websites. Enjoy a user-friendly menu
                                directly on Telegram, easily adding, editing, and noting items before payment.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="benefits-section">
                <div className="benefits-content">
                    <div className="image-container" style={{ height: '500px', width: '450px' }}>
                        <img src={benefitImage} alt="Food image" />
                    </div>

                    <div className="benefits-text">
                        <h2>Benefits You'll Get</h2>
                        <ul>
                            <li>Reach more customers on Telegram</li>
                            <li>Real-Time Menu Updates</li>
                            <li>Streamline Order Process</li>
                            <li>Enhance Customers' Experience</li>
                            <li>Seamless Operation Management</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="no-need-section">
                <h1>No need to...</h1>
                <div className="no-need-items">
                    <div className="item">
                        <img src={downloadIcon} alt="Download the app" />
                        <p>Download the app</p>
                    </div>
                    <div className="item">
                        <img src={handleOverloadIcon} alt="Handle overload" />
                        <p>Handle Overload</p>
                    </div>
                    <div className="item">
                        <img src={minimizeIcon} alt="Minimize business" />
                        <p>Minimize Busyness</p>
                    </div>
                </div>
            </section>

            <section className="features-section">
                <div className="features-header">
                    <h1>Stunning <br /> Features</h1>
                    <p>We offer a variety of interesting features that help streamline your restaurant operating process.</p>
                    <button className="get-started-btn">Get Started</button>
                </div>

                <div className="features-grid">
                    <div className="feature">
                        <img src={phoneImage1} alt="Insightful Analytics" className="phone-image" />
                        <h3>Insightful Analytics</h3>
                        <p>Understand your customers better with detailed sales and preference reports.</p>
                    </div>
                    <div className="feature">
                        <img src={phoneImage2} alt="Multi-Language Support" className="phone-image" />
                        <h3>Multi-Language Support</h3>
                        <p>Cater to a global audience with multiple language options.</p>
                    </div>
                    <div className="feature">
                        <img src={phoneImage3} alt="Online Ordering" className="phone-image" />
                        <h3>Online Ordering</h3>
                        <p>Enable customers to place orders directly from the digital menu.</p>
                    </div>
                    <div className="feature">
                        <img src={phoneImage4} alt="Full Functionalities" className="phone-image" />
                        <h3>Full Functionalities</h3>
                        <p>Integrate loyalty programs to reward repeat customers.</p>
                    </div>
                    <div className="feature">
                        <img src={phoneImage5} alt="Marketing Optimization" className="phone-image" />
                        <h3>Marketing Optimization</h3>
                        <p>Utilize built-in tools for promotions and marketing campaigns.</p>
                    </div>
                    <div className="feature">
                        <img src={phoneImage6} alt="Instant Payment" className="phone-image" />
                        <h3>Instant Payment</h3>
                        <p>Keep your menu fresh with real-time changes to items and prices.</p>
                    </div>
                </div>
            </section>

            <section className="pricing-section">
                <div className="pricing-header">
                    <div>
                        <h1>Choose Plan</h1>
                    </div>
                    <div>
                        <h1>That's Right For You</h1>
                    </div>
                    <p>Choose plan that works best for you, feel free to contact us</p>
                    <div className="toggle-buttons">
                        <button className="toggle-btn">Bi Monthly</button>
                        <button className="toggle-btn active">Bi Yearly</button>
                    </div>
                </div>

                <div className="plans-grid">
                    <div className="plan-card basic">
                        <h3>Basic</h3>
                        <p>Small business: restaurants, eateries, and cafes</p>
                        <h2>$0</h2>
                        <div style={{ backgroundColor: '#eff1f4', height: '200px', paddingTop: '50px', borderRadius: '15px' }}>
                            <ul>
                                <li>1 Branch</li>
                                <li>5 Sales Devices</li>
                            </ul>
                            <a href="#" className="btn-signup" style={{ color: 'white' }}>Sign Up</a>
                        </div>
                    </div>

                    <div className="plan-card pro">
                        <h3>Pro</h3>
                        <p>For larger businesses that require more functionality</p>
                        <h2>$99</h2>
                        <div style={{ backgroundColor: '#eff1f4', height: '200px', paddingTop: '50px', borderRadius: '15px' }}>
                            <ul>
                                <li>10 Branches</li>
                                <li>20 Sales Devices</li>
                                <li>Up to 10k orders/month</li>
                            </ul>
                            <a href="#" className="btn-signup" style={{ color: 'white' }}>Sign Up</a>
                        </div>
                    </div>

                    <div className="plan-card enterprise">
                        <h3>Enterprise</h3>
                        <p>For businesses that want tailored solutions and maximum features</p>
                        <h2>$199</h2>
                        <div style={{ backgroundColor: '#eff1f4', height: '200px', paddingTop: '50px', borderRadius: '15px' }}>
                            <ul>
                                <li>Unlimited Branches</li>
                                <li>Unlimited Sales Devices</li>
                                <li>Unlimited Orders</li>
                                <li>1-Year Free Trial</li>
                            </ul>
                            <a href="#" className="btn-signup" style={{ color: 'white' }}>Sign Up</a>
                        </div>
                    </div>
                </div>
            </section>

            <section className="testimonials-section">
                <h1>What Our Users Say</h1>
                <div className="testimonials-grid">
                    <div className="testimonial">
                        <img src={avatar1} alt="User 1" />
                        <h3>John Doe</h3>
                        <p>“Menu Master transformed our restaurant operations. Our customers love the digital menus!”</p>
                    </div>
                    <div className="testimonial">
                        <img src={avatar2} alt="User 2" />
                        <h3>Jane Smith</h3>
                        <p>“The instant updates and ease of use have made a huge difference in customer satisfaction!”</p>
                    </div>
                    <div className="testimonial">
                        <img src={avatar3} alt="User 3" />
                        <h3>Sam Wilson</h3>
                        <p>“Fantastic tool! It streamlined our service and made ordering a breeze for our guests.”</p>
                    </div>
                    <div className="testimonial">
                        <img src={avatar4} alt="User 4" />
                        <h3>Lisa Brown</h3>
                        <p>“Highly recommend Menu Master to any restaurant owner looking to upgrade their ordering system!”</p>
                    </div>
                </div>
            </section>

            <footer>
                <h2>Ready to Elevate Your Dining Experience?</h2>
                <button className="footer-button">Get Started</button>
                <p>Follow us on our social media channels!</p>
                <ul className="social-media-icons">
                    <li>Facebook</li>
                    <li>Twitter</li>
                    <li>Instagram</li>
                </ul>
            </footer>
        </div>
    );
};

export default landingPage;
