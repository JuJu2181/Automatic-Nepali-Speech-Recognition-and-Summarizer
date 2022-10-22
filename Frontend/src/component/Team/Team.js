import './team.css'  // This is the CSS file for this component'
import sudip from '../../static/teamimage/me.jpg'
import anish from '../../static/teamimage/anish-image.jpg'
import anjaan from '../../static/teamimage/anjaan-image.png'
import sachin from '../../static/teamimage/sachin-img.jpg'

export default function Team() {
  return (
    <div>
        <section class="section-team">
        <div class="container">
			
			<div class="row justify-content-center text-center">
				<div class="col-md-8 col-lg-6">
					<div class="header-section">
						
						<h2 class="title"> Our team members</h2>
					</div>
				</div>
			</div>
			
			<div class="row">
				
				<div class="col-sm-6 col-lg-4 col-xl-3">
					<div class="single-person">
						<div class="person-image">
								  <img src={ anish} alt=""/>
							<span class="icon">
								<i class="fa fa-graduation-cap"></i>
							</span>
						</div>
						<div class="person-info">
							<h3 class="full-name">Anish Shilpakar</h3>
							<span class="speciality">KCE075BCT008</span>
						</div>
					</div>
				</div>
				
				<div class="col-sm-6 col-lg-4 col-xl-3">
					<div class="single-person">
						<div class="person-image">
								  <img src={ anjaan} alt=""/>
							<span class="icon">
								<i class="fa fa-graduation-cap"></i>
							</span>
						</div>
						<div class="person-info">
							<h3 class="full-name">Anjaan Khadka</h3>
							<span class="speciality">KCE075BCT009</span>
						</div>
					</div>
				</div>
				
				<div class="col-sm-6 col-lg-4 col-xl-3">
					<div class="single-person">
						<div class="person-image">
								  <img src={ sachin} alt=""/>
							<span class="icon">
								<i class="fa fa-graduation-cap"></i>
							</span>
						</div>
						<div class="person-info">
							<h3 class="full-name">Sachin Manandhar</h3>
							<span class="speciality">KCE075BCT35</span>
						</div>
					</div>
				</div>
				
				<div class="col-sm-6 col-lg-4 col-xl-3">
					<div class="single-person">
						<div class="person-image">
							<img src={sudip} alt=""/>
							<span class="icon">
								<i class="fa fa-graduation-cap"></i>
							</span>
						</div>
						<div class="person-info">
							<h3 class="full-name">Sudip Shrestha</h3>
							<span class="speciality">KCE075BCT046</span>
						</div>
					</div>
				</div>
				
			</div>
		</div>
        </section>
    </div>
  )
}
