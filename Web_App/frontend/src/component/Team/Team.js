import './team.css'  // This is the CSS file for this component'
import sudip from '../../static/teamimage/me.jpg'
import anish from '../../static/teamimage/anish.jpg'
import sachin from '../../static/teamimage/sachin.jpg'
import anjaan from '../../static/teamimage/anjaan.png'
export default function Team() {
  return (
    <div>
        <section className="section-team">
        <div className="container">
			
			<div className="row justify-content-center text-center">
				<div className="col-md-8 col-lg-6">
					<div className="header-section">
						
						<h2 className='title-team'> TEAM MEMBERS </h2>
					</div>
				</div>
			</div>
			
			<div className="row">
				
				<div className="col-sm-6 col-lg-4 col-xl-3">
					<div className="single-person">
						<div className="person-image">
							<img src={anish} alt=""/>
							<span className="icon">
								<i className="fa fa-graduation-cap"></i>
							</span>
						</div>
						<div className="person-info">
							<h3 className="full-name">Anish Shilpakar</h3>
							<span className="speciality">KCE075BCT008</span>
						</div>
					</div>
				</div>
				
				<div className="col-sm-6 col-lg-4 col-xl-3">
					<div className="single-person">
						<div className="person-image">
							<img src={anjaan} alt=""/>
							<span className="icon">
								<i className="fa fa-graduation-cap"></i>
							</span>
						</div>
						<div className="person-info">
							<h3 className="full-name">Anjaan Khadka</h3>
							<span className="speciality">KCE075BCT009</span>
						</div>
					</div>
				</div>
				
				<div className="col-sm-6 col-lg-4 col-xl-3">
					<div className="single-person">
						<div className="person-image">
							<img src={sachin} alt=""/>
							<span className="icon">
								<i className="fa fa-graduation-cap"></i>
							</span>
						</div>
						<div className="person-info">
							<h3 className="full-name">Sachin Manandhar</h3>
							<span className="speciality">KCE075BCT035</span>
						</div>
					</div>
				</div>
				
				<div className="col-sm-6 col-lg-4 col-xl-3">
					<div className="single-person">
						<div className="person-image">
							<img src={sudip} alt=""/>
							<span className="icon">
								<i className="fa fa-graduation-cap"></i>
							</span>
						</div>
						<div className="person-info">
							<h3 className="full-name">Sudip Shrestha</h3>
							<span className="speciality">KCE075BCT046</span>
						</div>
					</div>
				</div>
				
			</div>
		</div>
        </section>
    </div>
  )
}
