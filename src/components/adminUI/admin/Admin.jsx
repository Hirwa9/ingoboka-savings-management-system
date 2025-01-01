import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Button, Form } from "react-bootstrap";
import './admin.css';
import MyToast from '../../common/Toast';
import { ArrowArcLeft, ArrowClockwise, BellSimple, Blueprint, Calendar, CaretRight, CashRegister, ChartBar, ChartPieSlice, Check, Coin, Coins, CurrencyDollarSimple, Files, FloppyDisk, Gear, Info, List, Notebook, Pen, Plus, SignOut, Table, User, Users, X } from '@phosphor-icons/react';
import { dashboardData, deposits, expenses, expensesTypes, generalReport, incomeExpenses, membersData } from '../../../data/data';
import ExportDomAsFile from '../../common/exportDomAsFile/ExportDomAsFile';
import DateLocaleFormat from '../../common/dateLocaleFormats/DateLocaleFormat';
import CurrencyText from '../../common/CurrencyText';
import LoadingIndicator from '../../LoadingIndicator';

const Admin = () => {

	// Toast
	const [showToast, setShowToast] = useState(false);
	const [toastMessage, setToastMessage] = useState('');
	const [toastType, setToastType] = useState('purple');

	const toast = (message, type) => {
		setShowToast(true);
		setToastMessage(message);
		setToastType(type || toastType);
	};

	const sideNavbarRef = useRef();
	const sideNavbarTogglerRef = useRef();
	const [sideNavbarIsFloated, setSideNavbarIsFloated] = useState(false);

	// Hide navbar
	const hideSideNavbar = useCallback(() => {
		if (sideNavbarIsFloated) {
			sideNavbarRef.current.classList.add('fadeOutF');
			setTimeout(() => {
				setSideNavbarIsFloated(false); // Close navbar
				sideNavbarRef.current.classList.remove('fadeOutF');
			}, 400);
		}
	}, [sideNavbarIsFloated]);

	// Handle clicks outside the navbar
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (sideNavbarRef.current && sideNavbarTogglerRef.current) {
				if (
					!sideNavbarRef.current.contains(e.target) &&
					!sideNavbarTogglerRef.current.contains(e.target)
				) {
					hideSideNavbar(); // Attempt to hide navbar
				}
			}
		};

		// Attach "click outside" event listener
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside); // Clean up
		};
	}, [hideSideNavbar]);

	/**
	 * Data
	*/

	const BASE_URL = 'http://localhost:5000';

	const [allMembers, setAllMembers] = useState();
	const [membersToShow, setMembersToShow] = useState();
	const [loadingMembers, setLoadingMembers] = useState(false);
	const [errorLoadingMembers, setErrorLoadingMembers] = useState(false);


	// Fetch members
	const fetchMembers = async () => {
		try {
			setLoadingMembers(true);
			const response = await fetch(`${BASE_URL}/users`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			// console.log(data);
			setAllMembers(data);
			setMembersToShow(data);
			setErrorLoadingMembers(null);
		} catch (error) {
			setErrorLoadingMembers("Failed to load members. Click the button to try again.");
			console.error("Error fetching members:", error);
		} finally {
			setLoadingMembers(false);
		}
	};

	useEffect(() => {
		fetchMembers();
	}, []);
	// console.log(membersToShow);

	// const [activeSection, setActiveSection] = useState("dashboard");
	// const [activeSection, setActiveSection] = useState("messages");
	// const [activeSection, setActiveSection] = useState("members");
	// const [activeSection, setActiveSection] = useState("savings");
	// const [activeSection, setActiveSection] = useState("credits");
	// const [activeSection, setActiveSection] = useState("interest");
	// const [activeSection, setActiveSection] = useState("transactions");
	const [activeSection, setActiveSection] = useState("reports");
	// const [activeSection, setActiveSection] = useState("settings");
	// const [activeSection, setActiveSection] = useState("auditLogs");

	const [isWaitingAdminEditAction, setIsWaitingAdminEditAction] = useState(false);

	/**
	 * Sections
	 */

	// Dashboard
	const Dashboard = () => {

		const [showExportDataDialog, setShowExportDataDialog] = useState(false);

		const accountingDashboardRef = useRef();

		const totalCotisation = allMembers.reduce((sum, item) => sum + item.cotisation, 0);
		const totalSocial = allMembers.reduce((sum, item) => sum + item.social, 0);
		const loanDelivered = dashboardData
			.filter((item) => item.label === "Loan Delivered")
			.map((item) => item.value);
		const interestToReceive = dashboardData
			.filter((item) => item.label === "Interest Receivable")
			.map((item) => item.value);
		const paidCapital = dashboardData
			.filter((item) => item.label === "Paid Capital")
			.map((item) => item.value);
		const paidInterest = dashboardData
			.filter((item) => item.label === "Paid Interest")
			.map((item) => item.value);
		const penalties = dashboardData
			.filter((item) => item.label === "Penalties")
			.map((item) => item.value);
		const expenses = dashboardData
			.filter((item) => item.label === "Expenses")
			.map((item) => item.value);
		const balance = dashboardData
			.filter((item) => item.label === "Balance")
			.map((item) => item.value);

		let labelvalue;
		switch (true) {
			case 'Cotisation':
				labelvalue = totalCotisation
				break;

			default:
				break;
		}

		return (
			<>

				<div ref={accountingDashboardRef} className="container py-4 bg-bodi">
					<h2 className="mb-3 text-center text-uppercase text-primaryColor">Accounting Dashboard</h2>
					<div className='flex-align-center mb-3'>
						<hr className='flex-grow-1 my-0' />
						<CurrencyDollarSimple size={45} className='mx-2 p-2 text-gray-500 border border-2 border-secondary border-opacity-25 rounded-circle' />
						<hr className='flex-grow-1 my-0' />
					</div>
					<div className="d-lg-flex align-items-center">
						<img src="images/dashboard_visual.png" alt="" className='col-md-5' />
						<div className='alert mb-4 rounded-0 smaller fw-light'>
							This numerical report provides a financial status overview for IKIMINA INGOBOKA saving management system. It highlights key metrics, including contributions, social funds, loans disbursed, interest receivables, paid capital, and other financial indicators. The report reflects the financial management system's performance, tracking transactions from stakeholder contributions, savings, investments, and other financial activities, all aligned with the system's saving balance and agreements established among its members.
						</div>
					</div>
					<div className="row gx-3 gy-4 gy-lg-3 pb-3 rounded-4">
						{dashboardData.map((item, index) => (
							<div className="col-md-6 col-lg-4" key={index}>
								<div className="card py-3 border-0 rounded-0 h-100 border-end border-4 border-secondaryColor">
									<div className="card-body">
										<h6 className="card-title mb-4 fs-5 text-uppercase fw-bold text-primaryColor">
											{item.label}
										</h6>
										<p className="card-text text-secondaryColor">
											{item.label === 'Cotisation' && <CurrencyText amount={totalCotisation} />}
											{item.label === 'Social' && <CurrencyText amount={totalSocial} />}
											{item.label === 'Loan Delivered' && <CurrencyText amount={loanDelivered} />}
											{item.label === 'Interest Receivable' && <CurrencyText amount={interestToReceive} />}
											{item.label === 'Paid Capital' && <CurrencyText amount={paidCapital} />}
											{item.label === 'Paid Interest' && <CurrencyText amount={paidInterest} />}
											{item.label === 'Penalties' && <CurrencyText amount={penalties} />}
											{item.label === 'Expenses' && <CurrencyText amount={expenses} />}
											{item.label === 'Balance' && <CurrencyText amount={balance} />}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
					<hr />
					<div>
						<p className='text'>
							Done on <span className="fw-semibold">{new Intl.DateTimeFormat('en-CA', {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
								hour12: true,
							}).format(new Date())}</span> by IKIMINA INGOBOKA Accountant, Alain Mugabe.
						</p>
					</div>
				</div>
				<div className="text-center my-4">
					<button className="btn bg-primaryColor text-light rounded-0 clickDown"
						onClick={() => setShowExportDataDialog(true)}
					>
						<Files size={22} /> Generate Report
					</button>
				</div>

				{/* Export Accounting dashboard */}
				<ExportDomAsFile
					show={showExportDataDialog}
					container={accountingDashboardRef}
					exportName='Accounting dashboard'
					onClose={() => { setShowExportDataDialog(false) }}
				/>
			</>
		);
	}

	// Member
	const Members = () => {
		const [membersToshow, setMembersToshow] = useState(allMembers);
		const [memberSearchValue, setMemberSearchValue] = useState('');

		// Search members
		const memberSearcherRef = useRef();

		const filterMembersBySearch = useCallback(() => {
			const searchString = memberSearchValue.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
			if (searchString !== null && searchString !== undefined && searchString !== '') {
				// showAllProperties(true);
				const filteredmembers = allMembers.filter(val => 
					{
						console.log(val.husbandFirstName.toLowerCase());
						return val.husbandFirstName;
					}
				);
				// const filteredmembers = allMembers.filter(val => (
				// 	val.husbandFirstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(searchString) ||
				// 	val.husbandFirstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(searchString) ||
				// 	val.wifeFirstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(searchString) ||
				// 	val.wifeLstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(searchString) ||
				// 	val.husbandEmail.toLowerCase().includes(searchString) ||
				// 	val.wifeEmail.toLowerCase().includes(searchString) ||
				// 	val.husbandPhone.replace(/[ ()+]/g, '').toLowerCase().includes(searchString) ||
				// 	val.wifePhone.replace(/[ ()+]/g, '').toLowerCase().includes(searchString)
				// ));
				setMembersToshow(filteredmembers);
			}
		}, [memberSearchValue]);

		const resetMembers = () => {
			setMembersToshow(allMembers);
		}

		// Reset members
		useEffect(() => {
			if (memberSearchValue === '') {
				resetMembers();
			}
		}, [memberSearchValue]);

		return (
			<div className="pt-2 pt-md-0 pb-3">
				<div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
					<h2><Users weight='fill' className="me-1 opacity-50" /> Members</h2>
					<div className="ms-auto">
						<Button variant="primary" className='btn-sm rounded-0 border-end text-light clickDown'><ChartBar /> <span className='d-none d-sm-inline'>Statistics</span></Button>
						<Button variant="primary" className='btn-sm rounded-0 border-end text-light clickDown'><Plus /> New member</Button>
					</div>
				</div>

				<div className="members-wrapper">
					{loadingMembers && (<LoadingIndicator icon={<Users size={80} className="loading-skeleton" />} />)}
					{!loadingMembers && membersToshow.length === 0 && (
						<div className="col-sm-8 col-md-6 col-lg-5 col-xl-4 mx-auto my-5 p-3 rounded error-message">
							<img src="/images/fetch_error_image.jpg" alt="Error" className="w-4rem h-4rem mx-auto mb-2 opacity-50" />
							<p className="text-center text-muted small">
								No members found.
							</p>
							<button className="btn btn-sm btn-outline-secondary d-block border-0 rounded-pill mx-auto px-4" onClick={resetMembers}>
								<ArrowClockwise weight="bold" size={18} className="me-1" /> Refresh
							</button>
						</div>
					)}
					{!loadingMembers && membersToshow.length > 0 && (
						<>
							{/* Search bar */}
							<Form onSubmit={e => e.preventDefault()} className='sticky-top col-lg-6 col-xxl-4 members-search-box'>
								<Form.Control ref={memberSearcherRef} type="text" placeholder="🔍 Search members..." id='memberSearcher' className="h-2_5rem border border-2 bg-gray-200 rounded-0"
									value={memberSearchValue} onChange={(e) => setMemberSearchValue(e.target.value)}
									onKeyUp={e => { (e.key === "Enter") && filterMembersBySearch() }}
								/>
								{memberSearchValue !== '' && (
									<X className='ptr r-middle-m me-1' onClick={() => setMemberSearchValue('')} />
								)}
							</Form>
							{/* Content */}
							{membersToshow
								.sort((a, b) => a.husbandFirstName.localeCompare(b.husbandFirstName))
								.map((member, index) => (
									<div className="position-relative mb-3 my-5 px-2 pt-5 border-top border-3 border-secondary border-opacity-25 text-gray-800 member-element"
										key={index}
									>
										<div className="position-absolute top-0 me-3 d-flex gap-3"
											style={{ right: 0, translate: "0 -50%" }}
										>
											<img src={member.husbandAvatar}
												alt={`${member.husbandFirstName.slice(0, 1)}.${member.husbandLastName}`}
												className="w-5rem ratio-1-1 object-fit-cover p-1 border border-3 border-secondary border-opacity-25 bg-light rounded-circle"
											/>
											<img src={member.wifeAvatar}
												alt={`${member.wifeFirstName.slice(0, 1)}.${member.wifeLastName}`}
												className="w-5rem ratio-1-1 object-fit-cover p-1 border border-3 border-secondary border-opacity-25 bg-light rounded-circle"
											/>
										</div>

										<button className="btn btn-sm bg-gray-400 text-dark position-absolute top-0 start-0 ms-3 translate-middle-y">
											<Pen className="me-1" /> Edit
										</button>

										<div className="px-lg-2">
											<h5 className="mb-3 fs-4">{`${member.husbandFirstName} ${member.husbandLastName}`}</h5>
											<div className="d-lg-flex">
												<div className="col-lg-6">
													<h6 className="flex-align-center px-2 py-1 border-bottom border-2 text-primaryColor fw-bolder">
														<User className="me-1" /> Husband
													</h6>
													<ul className="list-unstyled text-gray-700 px-2 smaller">
														<li className="py-1">
															<b>Names:</b> {`${member.husbandFirstName} ${member.husbandLastName}`}
														</li>
														<li className="py-1">
															<b>Phone:</b> {member.husbandPhone}
														</li>
														<li className="py-1">
															<b>Email:</b> {member.husbandEmail}
														</li>
													</ul>
												</div>
												<div className="col-lg-6 px-lg-2">
													<h6 className="flex-align-center px-2 py-1 border-bottom border-2 text-primaryColor fw-bolder">
														<User className="me-1" /> Wife
													</h6>
													<ul className="list-unstyled text-gray-700 px-2 smaller">
														<li className="py-1">
															<b>Names:</b> {`${member.wifeFirstName} ${member.wifeLastName}`}
														</li>
														<li className="py-1">
															<b>Phone:</b> {member.wifePhone}
														</li>
														<li className="py-1">
															<b>Email:</b> {member.wifeEmail}
														</li>
													</ul>
												</div>
											</div>
										</div>
									</div>
								))
							}
						</>
					)}
				</div>
			</div>
		);
	}

	// Savings
	const Savings = () => {
		const [savingsToshow, setSavingsToshow] = useState(allMembers);
		const [savingSearchValue, setSavingSearchValue] = useState('');

		// Search savings
		const savingSearcherRef = useRef();

		const filterSavingsBySearch = useCallback(() => {
			const searchString = savingSearchValue.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
			if (searchString !== null && searchString !== undefined && searchString !== '') {
				// showAllProperties(true);
				const filteredsavings = allMembers.filter(val => (
					val.husbandFirstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(searchString) ||
					val.husbandLastName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(searchString) ||
					val.wifeFirstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(searchString) ||
					val.wifeLastName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(searchString) ||
					val.husbandEmail.toLowerCase().includes(searchString) ||
					val.wifeEmail.toLowerCase().includes(searchString) ||
					val.husbandPhone.replace(/[ ()+]/g, '').toLowerCase().includes(searchString) ||
					val.wifePhone.replace(/[ ()+]/g, '').toLowerCase().includes(searchString)
				));
				setSavingsToshow(filteredsavings);
			}
		}, [savingSearchValue]);

		const resetSavings = () => {
			setSavingsToshow(allMembers);
		}

		// Reset savings
		useEffect(() => {
			if (savingSearchValue === '') {
				resetSavings();
			}
		}, [savingSearchValue]);

		// Add saving
		const [showAddSavingRecord, setShowAddSavingRecord] = useState(false);
		const [savingRecordType, setSavingRecordType] = useState('cotisation');
		const [savingRecordAmount, setSavingRecordAmount] = useState('');
		const [selectedMember, setSelectedMember] = useState(allMembers[0]);


		// Handle create property
		const handleAddSaving = async (e) => {
			e.preventDefault();
		}

		return (
			<div className="pt-2 pt-md-0 pb-3">
				<div className="mb-3">
					<h2><Coin weight='fill' className="me-1 opacity-50" /> Savings panel</h2>
					<div className="d-lg-flex align-items-center">
						<img src="images/savings_visual.png" alt="" className='col-md-5' />
						<div className='alert mb-4 rounded-0 smaller fw-light'>
							Below is a comprehensive overview of each member's or family's savings balance, accompanied by the total number of shares they hold. This information provides a clear and organized view of individual contributions and associated ownership stakes, ensuring transparency and easy tracking of savings progress.
						</div>
					</div>
				</div>
				<hr className='mb-4 d-lg-none' />

				<div className="savings-wrapper">
					{loadingMembers && (<LoadingIndicator icon={<Coin size={80} className="loading-skeleton" />} />)}
					{!loadingMembers && savingsToshow.length === 0 && (
						<div className="col-sm-8 col-md-6 col-lg-5 col-xl-4 mx-auto my-5 p-3 rounded error-message">
							<img src="/images/fetch_error_image.jpg" alt="Error" className="w-4rem h-4rem mx-auto mb-2 opacity-50" />
							<p className="text-center text-muted small">
								No members found.
							</p>
							<button className="btn btn-sm btn-outline-secondary d-block border-0 rounded-pill mx-auto px-4" onClick={resetSavings}>
								<ArrowClockwise weight="bold" size={18} className="me-1" /> Refresh
							</button>
						</div>
					)}
					{!loadingMembers && savingsToshow.length > 0 && (
						<>
							{/* Search bar */}
							<Form onSubmit={e => e.preventDefault()} className='sticky-top col-lg-6 col-xxl-4 savings-search-box'>
								<Form.Control ref={savingSearcherRef} type="text" placeholder="🔍 Search members..." id='savingSearcher' className="h-2_5rem border border-2 bg-gray-200 rounded-0"
									value={savingSearchValue} onChange={(e) => setSavingSearchValue(e.target.value)}
									onKeyUp={e => { (e.key === "Enter") && filterSavingsBySearch() }}
								/>
								{savingSearchValue !== '' && (
									<X className='ptr r-middle-m me-1' onClick={() => setSavingSearchValue('')} />
								)}
							</Form>
							{/* Content */}

							<div className="d-lg-flex flex-wrap">
								{savingsToshow
									.sort((a, b) => a.husbandFirstName.localeCompare(b.husbandFirstName))
									.map((member, index) => (
										<div key={index} className='col-lg-6 px-lg-3'>
											<div className="position-relative mb-3 my-5 px-2 pt-5 border-top border-3 border-secondary border-opacity-25 text-gray-800 member-element"
											>
												<div className="position-absolute top-0 me-3 d-flex gap-3"
													style={{ right: 0, translate: "0 -50%" }}
												>
													<img src={member.husbandAvatar}
														alt={`${member.husbandFirstName.slice(0, 1)}.${member.husbandLastName}`}
														className="w-5rem ratio-1-1 object-fit-cover p-1 border border-3 border-secondary border-opacity-25 bg-light rounded-circle"
													/>
												</div>
												<div className="px-lg-2">
													<h5 className="mb-3 fs-4">{`${member.husbandFirstName} ${member.husbandLastName}`}</h5>
													<ul className="list-unstyled text-gray-700 px-2 smaller">
														<li className="py-1 w-100">
															<span className="flex-align-center">
																<b className='fs-5'>{member.shares} Shares</b>
																<span className='ms-3 text-primary flex-align-center ptr clickDown' title='Edit multiple shares'><Pen size={22} className='me-2' /> Multiple shares</span>
															</span>
														</li>
														<li className="py-1 d-table-row">
															<span className='d-table-cell border-start border-secondary ps-2'>Cotisation:</span> <span className='d-table-cell ps-2'>{member.cotisation.toLocaleString()} RWF</span>
														</li>
														<li className="py-1 d-table-row">
															<span className='d-table-cell border-start border-secondary ps-2'>Social:</span> <span className='d-table-cell ps-2'>{member.social.toLocaleString()} RWF</span>
														</li>
														<li className="py-1 fs-5 d-table-row">
															<b className='d-table-cell'>Total:</b> <span className='d-table-cell ps-2'>{(member.cotisation + member.social).toLocaleString()} RWF</span>
														</li>
													</ul>
													<button className="btn btn-sm btn-outline-primary w-100 flex-center rounded-0 clickDown"
														onClick={() => { setSelectedMember(member); setShowAddSavingRecord(true) }}
													><Plus className='me-1' /> Save amount</button>
												</div>
											</div>
										</div>
									))
								}
							</div>

							{showAddSavingRecord &&
								<>
									<div className='position-fixed fixed-top inset-0 bg-black2 py-5 inx-high add-property-form'>
										<div className="container col-md-6 col-lg-5 col-xl-4 peak-borders-b overflow-auto" style={{ animation: "zoomInBack .2s 1", maxHeight: '100%' }}>
											<div className="container h-100 bg-light text-gray-700 px-3">
												<h6 className="sticky-top flex-align-center justify-content-between mb-4 pt-3 pb-2 bg-light text-gray-600 border-bottom text-uppercase">
													<div className='flex-align-center'>
														<CashRegister weight='fill' className="me-1" />
														<span style={{ lineHeight: 1 }}>Add savings</span>
													</div>
													<div title="Cancel" onClick={() => { setShowAddSavingRecord(false); setSavingRecordAmount('') }}>
														<X size={25} className='ptr' />
													</div>
												</h6>
												<div className="flex-align-center gap-3 mb-3">
													<img src={selectedMember.husbandAvatar}
														alt={`${selectedMember.husbandFirstName.slice(0, 1)}.${selectedMember.husbandLastName}`}
														className="w-3rem ratio-1-1 object-fit-cover p-1 border border-3 border-secondary border-opacity-25 bg-light rounded-circle"
													/>
													<div>
														Add savings for <b className='fw-semibold'>{selectedMember.husbandFirstName} {selectedMember.husbandLastName}</b>
													</div>
												</div>
												<hr />

												{/* The form */}
												<form onSubmit={(e) => handleAddSaving(e)} className="px-sm-2 pb-5">
													<div className="mb-3">
														<p htmlFor="expenseType" className="fw-bold small">
															Saving type: <span className="text-primary text-capitalize">{savingRecordType}</span>
														</p>
														<ul className="list-unstyled d-flex">
															<li className={`col-6 px-2 py-1 text-center ${savingRecordType === 'cotisation' ? 'text-bg-primary' : ''} rounded-pill ptr clickDown`}
																onClick={() => setSavingRecordType('cotisation')}
															>
																Cotisation
															</li>
															<li className={`col-6 px-2 py-1 text-center ${savingRecordType === 'social' ? 'text-bg-primary' : ''} rounded-pill ptr clickDown`}
																onClick={() => setSavingRecordType('social')}
															>
																Social
															</li>

														</ul>
													</div>
													<div className="mb-3">
														<label htmlFor="savingAmount" className="form-label fw-bold" required>Saving amount ({savingRecordAmount !== '' ? Number(savingRecordAmount).toLocaleString() : ''} RWF )</label>
														<input type="number" id="savingAmount" name="savingAmount" className="form-control" required placeholder="Enter amount"
															value={savingRecordAmount}
															onChange={e => setSavingRecordAmount(e.target.value)}
														/>
													</div>
													<button type="submit" className="btn btn-sm btn-dark flex-center w-100 mt-3 py-2 px-4 rounded-pill clickDown" id="addSavingBtn"
													>
														{!isWaitingAdminEditAction ?
															<>Save Amount <FloppyDisk size={18} className='ms-2' /></>
															: <>Working <span className="spinner-grow spinner-grow-sm ms-2"></span></>
														}
													</button>
												</form>
											</div>
										</div>
									</div>
								</>
							}
						</>
					)}
				</div>
			</div>
		);
	}

	// Interest
	const Interest = () => {


		const [showExportDataDialog, setShowExportDataDialog] = useState(false);
		const interestPartitionViewRef = useRef();

		const totalShares = allMembers.reduce((sum, item) => sum + item.shares, 0);
		const interestToReceive = dashboardData
			.filter((item) => item.label === "Interest Receivable")
			.map((item) => item.value);
		let totalInterestReceivable = 0;
		let totalInterestRemain = 0;

		// const [activeTransactionSection, setActiveTransactionSection] = useState('withdrawals');
		// const [activeTransactionSectionColor, setActiveTransactionSectionColor] = useState('#f4e4b675');

		// // Adding expense records
		// const [showAddExpenseRecord, setShowAddExpenseRecord] = useState(false);
		// const [expenseRecordAmount, setExpenseRecordAmount] = useState('');

		return (
			<div className="pt-2 pt-md-0 pb-3">
				<div className="mb-3">
					<h2><Coins weight='fill' className="me-1 opacity-50" /> Interest panel</h2>
					<div className="d-lg-flex align-items-center">
						<img src="images/interests_visual.png" alt="" className='d-none d-lg-block col-md-5' />
						<div className='alert mb-4 rounded-0 smaller fw-light'>
							This panel provides an organized summary of interest earnings distributed to each member or family, based on their ownership shares. It ensures transparency by displaying individual share percentages, monetary interest amounts, and overall totals, offering members a clear understanding of their returns and fostering accountability.
						</div>
					</div>
				</div>
				<hr className='mb-4 d-lg-none' />
				<div ref={interestPartitionViewRef}  >
					<div className="alert alert-info smaller">
						<p className='display-6'>
							Statut des intérêts annuels
						</p>
						<Calendar size={25} className='me-2' /> Année {new Date().getFullYear()}
					</div>
					<div className='overflow-auto mb-5'>
						<table className="table table-hover h-100 properties-table">
							<thead className='table-success position-sticky top-0 inx-1'>
								<tr>
									<th className='py-3 text-nowrap text-gray-700'>N°</th>
									<th className='py-3 text-nowrap text-gray-700'>Member</th>
									<th className='py-3 text-nowrap text-gray-700'>Shares</th>
									<th className='py-3 text-nowrap text-gray-700'>Percentage (%)</th>
									<th className='py-3 text-nowrap text-gray-700'>Interest <sub className='fs-60'>/RWF</sub></th>
									<th className='py-3 text-nowrap text-gray-700'>Receavable<sub className='fs-60'>/RWF</sub></th>
									<th className='py-3 text-nowrap text-gray-700'>Remains<sub className='fs-60'>/RWF</sub></th>
									<th className='py-3 text-nowrap text-gray-700'>Status</th>
								</tr>
							</thead>
							<tbody>
								{allMembers
									.sort((a, b) => a.husbandFirstName.localeCompare(b.husbandFirstName))
									.map((item, index) => {
										const memberNames = `${item.husbandFirstName} ${item.husbandLastName}`;
										const percentageShares = ((item.shares * 100) / totalShares).toFixed(3);
										// Interest = (Total interest * Percentage shares) / 100
										const interest = (((item.shares * 100) / totalShares) * Number(interestToReceive)) / 100;
										// Interest to receive => divisible by 20000
										const interestReceivable = Math.floor((interest) / 20000) * 20000;
										const interestRemains = interest - interestReceivable;
										totalInterestReceivable += interestReceivable;
										totalInterestRemain += interestRemains;

										return (
											<tr
												key={index}
												className="small cursor-default clickDown interest-row"
											>
												<td className="border-bottom-3 border-end">
													{index + 1}
												</td>
												<td className='text-nowrap'>
													{memberNames}
												</td>
												<td>
													{item.shares}
												</td>
												<td className="text-nowrap">
													{percentageShares} %
												</td>
												<td className="text-nowrap fw-bold text-gray-700">
													<CurrencyText amount={interest} smallCurrency />
												</td>
												<td className="text-nowrap fw-bold text-success">
													<CurrencyText amount={interestReceivable} smallCurrency />
												</td>
												<td className="text-nowrap text-gray-700">
													<CurrencyText amount={interestRemains} smallCurrency />
												</td>
												<td>
													Pending
												</td>
											</tr>
										)
									})
								}
								<tr className="small cursor-default fs-5 table-success clickDown interest-row">
									<td className="border-bottom-3 border-end" title='Total'>
										T
									</td>
									<td className='text-nowrap'>
										{allMembers.length} <span className="fs-60">members</span>
									</td>
									<td className='text-nowrap'>
										{totalShares} <span className="fs-60">shares</span>
									</td>
									<td className="text-nowrap">
										100 <span className="fs-60">%</span>
									</td>
									<td className="text-nowrap fw-bold">
										<CurrencyText amount={interestToReceive} smallCurrency />
									</td>
									<td className="text-nowrap fw-bold text-success">
										<CurrencyText amount={totalInterestReceivable} smallCurrency />
									</td>
									<td className="text-nowrap">
										<CurrencyText amount={totalInterestRemain} smallCurrency />
									</td>
									<td>
										<div className='d-flex flex-column'></div>
										{/* <div className='text-nowrap fs-65 text-success'>4 Delivered</div> */}
										<div className='text-nowrap fs-65'>8 Pending</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				{/* Exporter */}
				<div className='small'>
					<div className="d-flex flex-wrap gap-2">
						<button className="btn btn-sm bg-primaryColor text-light rounded-0 clickDown"
							onClick={() => setShowExportDataDialog(true)}
						>
							<Files size={22} /> Generate Report
						</button>
						<p className='p-2 smaller'>
							<Info className='me-1' />
							Click the button to generate selected year's interest partition status.
						</p>
					</div>
				</div>



				{/* Export report tables */}
				<ExportDomAsFile
					show={showExportDataDialog}
					container={interestPartitionViewRef}
					exportName={`Statut des intérêts annuels __ Année ${new Date().getFullYear()}`}
					onClose={() => { setShowExportDataDialog(false) }}
				/>

			</div>
		)
	}

	// Credit
	const Credit = () => {
		const [activeLoanSection, setActiveLoanSection] = useState('approved');
		const [activeLoanSectionColor, setActiveLoanSectionColor] = useState('#a3d5bb75');

		// Filtering credits

		const [membersToshow, setMembersToshow] = useState(allMembers);
		const [memberSearchValue, setMemberSearchValue] = useState('');

		// Search members
		const memberSearcherRef = useRef();

		const filterMembersBySearch = useCallback(() => {
			const searchString = memberSearchValue.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
			if (searchString !== null && searchString !== undefined && searchString !== '') {
				// showAllProperties(true);
				const filteredmembers = allMembers.filter(val => (
					val.husbandFirstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(searchString) ||
					val.husbandLastName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(searchString) ||
					val.wifeFirstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(searchString) ||
					val.wifeLastName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(searchString) ||
					val.husbandEmail.toLowerCase().includes(searchString) ||
					val.wifeEmail.toLowerCase().includes(searchString) ||
					val.husbandPhone.replace(/[ ()+]/g, '').toLowerCase().includes(searchString) ||
					val.wifePhone.replace(/[ ()+]/g, '').toLowerCase().includes(searchString)
				));
				setMembersToshow(filteredmembers);
			}
		}, [memberSearchValue]);

		const resetMembers = () => {
			setMembersToshow(allMembers);
		}

		// Reset members
		useEffect(() => {
			if (memberSearchValue === '') {
				resetMembers();
			}
		}, [memberSearchValue]);

		return (
			<div className="pt-2 pt-md-0 pb-3">
				<h2><Blueprint weight='fill' className="me-1 opacity-50" /> Credit panel</h2>

				<Form onSubmit={e => e.preventDefault()} className='sticky-top col-lg-6 col-xxl-4 members-search-box'>
					<Form.Control ref={memberSearcherRef} type="text" placeholder="🔍 Search members..." id='memberSearcher' className="h-2_5rem border border-2 bg-gray-200 rounded-0"
						value={memberSearchValue} onChange={(e) => setMemberSearchValue(e.target.value)}
						onKeyUp={e => { (e.key === "Enter") && filterMembersBySearch() }}
					/>
					{memberSearchValue !== '' && (
						<X className='ptr r-middle-m me-1' onClick={() => setMemberSearchValue('')} />
					)}
				</Form>
				<div className='text-gray-700 selective-options' style={{ backgroundColor: activeLoanSectionColor }}>
					{/* <h4 className='h6 mb-2 text-center fw-bold text-decoration-underline' style={{ textUnderlineOffset: '3px' }}>Loan requests</h4> */}

					{/* Selectors */}
					<div className="d-flex flex-wrap justify-content-center">
						<div className={`col d-flex flex-column flex-sm-row column-gap-2 p-2 border-top border-bottom border-2 border-warning border-opacity-25 tab-selector ${activeLoanSection === 'pending' ? 'active' : ''} user-select-none ptr clickDown`}
							style={{ '--_activeColor': '#f4e4b6' }}
							onClick={() => { setActiveLoanSection('pending'); setActiveLoanSectionColor('#f4e4b675') }}
						>
							<h5 className='mb-0 small'>Pending</h5>
							<p className='mb-0 fs-75'>( 1 )</p>
						</div>
						<div className={`col d-flex flex-column flex-sm-row column-gap-2 p-2 border-top border-bottom border-2 border-success border-opacity-25 tab-selector ${activeLoanSection === 'approved' ? 'active' : ''} user-select-none ptr clickDown`}
							style={{ '--_activeColor': '#a3d5bb' }}
							onClick={() => { setActiveLoanSection('approved'); setActiveLoanSectionColor('#a3d5bb75') }}
						>
							<h5 className='mb-0 small'>Approved</h5>
							<p className='mb-0 fs-75'>( 3 )</p>
						</div>
						<div className={`col d-flex flex-column flex-sm-row column-gap-2 p-2 border-top border-bottom border-2 border-danger border-opacity-25 tab-selector ${activeLoanSection === 'rejected' ? 'active' : ''} user-select-none ptr clickDown`}
							style={{ '--_activeColor': '#ebc1c5' }}
							onClick={() => { setActiveLoanSection('rejected'); setActiveLoanSectionColor('#ebc1c575') }}
						>
							<h5 className='mb-0 small'>Rejected</h5>
							<p className='mb-0 fs-75'>( 2 )</p>
						</div>
					</div>

					{/* Selected content */}
					<div>
						{activeLoanSection === 'pending' && (
							<div className='overflow-auto'>
								<table className="table table-hover h-100 properties-table">
									<thead className='table-warning position-sticky top-0 inx-1'>
										<tr>
											<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
											<th className='py-3 text-nowrap text-gray-700' style={{ minWidth: '10rem' }}>Member</th>
											<th className='py-3 text-nowrap text-gray-700'>Amount  <sub className='fs-60'>/RWF</sub></th>
											<th className='py-3 text-nowrap text-gray-700'>Date & Interval</th>
											<th className='py-3 text-nowrap text-gray-700' style={{ maxWidth: '13rem' }} >Comment</th>
											<th className='py-3 text-nowrap text-gray-700'>Action</th>
										</tr>
									</thead>
									<tbody>
										<tr
											className={`small cursor-default clickDown loan-row`}
										>
											<td className={`ps-sm-3  border-bottom-3 border-end`}>
												1
											</td>
											<td >
												Alain Mugabe
											</td>
											<td className="d-flex flex-column gap-2 text-muted small" >
												<div>
													<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Loan</h6>
													<span>10,000,000</span>
												</div>
												<div>
													<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Interest</h6>
													<span>50,000</span>
												</div>
											</td>
											<td className='text-nowrap'>
												<div className='d-flex flex-column gap-2 smaller'>
													<span className='fw-bold'>13-11-2024 <CaretRight /> 13-03-2025</span>
													<span>0 Years, 4 Months, 2 Days</span>
												</div>
											</td>
											<td style={{ maxWidth: '13rem' }}>
												Demande de credit
											</td>
											<td className='text-nowrap fs-75'>
												<div className="dim-100 d-flex">
													<button className='btn btn-sm text-primary-emphasis border-primary border-opacity-25 mb-auto rounded-pill'>
														<Check /> Approve
													</button>
													<button className='btn btn-sm text-danger-emphasis border-danger border-opacity-25 mt-auto rounded-pill'>
														<X /> Reject
													</button>
												</div>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						)}

						{activeLoanSection === 'approved' && (
							<div className='overflow-auto'>
								<table className="table table-hover h-100 properties-table">
									<thead className='table-success position-sticky top-0 inx-1'>
										<tr>
											<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
											<th className='py-3 text-nowrap text-gray-700' style={{ minWidth: '10rem' }}>Member</th>
											<th className='py-3 text-nowrap text-gray-700'>Amount  <sub className='fs-60'>/RWF</sub></th>
											<th className='py-3 text-nowrap text-gray-700'>Date & Interval</th>
											<th className='py-3 text-nowrap text-gray-700' style={{ maxWidth: '13rem' }} >Comment</th>
											<th className='py-3 text-nowrap text-gray-700'>Credit Status</th>
										</tr>
									</thead>
									<tbody>
										<tr
											className={`small cursor-default clickDown loan-row`}
										>
											<td className={`ps-sm-3  border-bottom-3 border-end`}>
												1
											</td>
											<td >
												Leonidas Dusabimana
											</td>
											<td className="d-flex flex-column gap-2 text-muted small" >
												<div>
													<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Loan</h6>
													<span>6,000,000</span>
												</div>
												<div>
													<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Interest</h6>
													<span>300,000</span>
												</div>
											</td>
											<td className='text-nowrap'>
												<div className='d-flex flex-column gap-2 smaller'>
													<span className='fw-bold'>03-12-2024 <CaretRight /> 03-06-2025</span>
													<span>0 Years, 6 Months, 2 Days</span>
												</div>
											</td>
											<td style={{ maxWidth: '13rem' }}>
												Top up
											</td>
											<td className='text-nowrap fs-75'>
												Transfered
											</td>
										</tr>
										<tr
											className={`small cursor-default clickDown loan-row`}
										>
											<td className={`ps-sm-3  border-bottom-3 border-0 border-end`}>
												2
											</td>
											<td >
												Innocent Ngoboka
											</td>
											<td className="d-flex flex-column gap-2 text-muted small" >
												<div>
													<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Loan</h6>
													<span>100,000</span>
												</div>
												<div>
													<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Interest</h6>
													<span>5,000</span>
												</div>
											</td>
											<td className='text-nowrap'>
												<div className='d-flex flex-column gap-2 smaller'>
													<span className='fw-bold'>07-11-2024 <CaretRight /> 07-03-2025</span>
													<span>0 Years, 4 Months, 0 Days</span>
												</div>
											</td>
											<td style={{ maxWidth: '13rem' }}>
												Demande de credit
											</td>
											<td className='text-nowrap fs-75'>
												Transfered
											</td>
										</tr>
										<tr
											className={`small cursor-default clickDown loan-row`}
										>
											<td className={`ps-sm-3  border-bottom-3 border-0 border-end`}>
												3
											</td>
											<td >
												Alain Mugabe
											</td>
											<td className="d-flex flex-column gap-2 text-muted small" >
												<div>
													<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Loan</h6>
													<span>900,000</span>
												</div>
												<div>
													<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Interest</h6>
													<span>45,000</span>
												</div>
											</td>
											<td className='text-nowrap'>
												<div className='d-flex flex-column gap-2 smaller'>
													<span className='fw-bold'>15-10-2024 <CaretRight /> 15-04-2025</span>
													<span>0 Years, 6 Months, 2 Days</span>
													<span>6 tranches</span>
												</div>
											</td>
											<td style={{ maxWidth: '13rem' }}>
												Demande de credit
											</td>
											<td className='text-nowrap fs-75'>
												Transfered
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						)}

						{activeLoanSection === 'rejected' && (
							<div className='overflow-auto'>
								<table className="table table-hover h-100 properties-table">
									<thead className='table-danger position-sticky top-0 inx-1'>
										<tr>
											<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
											<th className='py-3 text-nowrap text-gray-700' style={{ minWidth: '10rem' }}>Member</th>
											<th className='py-3 text-nowrap text-gray-700'>Amount  <sub className='fs-60'>/RWF</sub></th>
											<th className='py-3 text-nowrap text-gray-700'>Date & Interval</th>
											<th className='py-3 text-nowrap text-gray-700' style={{ maxWidth: '13rem' }} >Comment</th>
											<th className='py-3 text-nowrap text-gray-700' style={{ maxWidth: '13rem' }} >Rejection</th>
											<th className='py-3 text-nowrap text-gray-700'>Action</th>
										</tr>
									</thead>
									<tbody>
										<tr
											className={`small cursor-default clickDown loan-row`}
										>
											<td className={`ps-sm-3  border-bottom-3 border-end`}>
												1
											</td>
											<td >
												Alain Mugabe
											</td>
											<td className="d-flex flex-column gap-2 text-muted small" >
												<div>
													<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Loan</h6>
													<span>10,000,000</span>
												</div>
												<div>
													<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Interest</h6>
													<span>50,000</span>
												</div>
											</td>
											<td className='text-nowrap'>
												<div className='d-flex flex-column gap-2 smaller'>
													<span className='fw-bold'>13-11-2024 <CaretRight /> 13-03-2025</span>
													<span>0 Years, 4 Months, 2 Days</span>
												</div>
											</td>
											<td style={{ maxWidth: '13rem' }}>
												Demande de credit
											</td>
											<td style={{ maxWidth: '13rem' }}>
												Insufficient balance
											</td>
											<td className='text-nowrap fs-75'>
												<button className='btn btn-sm btn-outline-secondary rounded-0'>
													<ArrowArcLeft /> Restore
												</button>
											</td>
										</tr>
										<tr
											className={`small cursor-default clickDown loan-row`}
										>
											<td className={`ps-sm-3  border-bottom-3 border-end`}>
												2
											</td>
											<td >
												Bonaventure Nzeyimana
											</td>
											<td className="d-flex flex-column gap-2 text-muted small" >
												<div>
													<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Loan</h6>
													<span>4,000,000</span>
												</div>
												<div>
													<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Interest</h6>
													<span>200,000</span>
												</div>
											</td>
											<td className='text-nowrap'>
												<div className='d-flex flex-column gap-2 smaller'>
													<span className='fw-bold'>13-11-2024 <CaretRight /> 13-03-2025</span>
													<span>0 Years, 4 Months, 2 Days</span>
													<span>6 tranches</span>
												</div>
											</td>
											<td style={{ maxWidth: '13rem' }}>
												Payment will be due on 15th each month
											</td>
											<td style={{ maxWidth: '13rem' }}>
												Some reasons
											</td>
											<td className='text-nowrap fs-75'>
												<button className='btn btn-sm btn-outline-secondary rounded-0'>
													<ArrowArcLeft /> Restore
												</button>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	// Transactions
	const Transactions = () => {
		const [activeTransactionSection, setActiveTransactionSection] = useState('withdrawals');
		const [activeTransactionSectionColor, setActiveTransactionSectionColor] = useState('#f4e4b675');

		// Adding expense records
		const [showAddExpenseRecord, setShowAddExpenseRecord] = useState(false);
		const [expenseRecordAmount, setExpenseRecordAmount] = useState('');

		// Handle create property
		const handleAddExpense = async (e) => {
			e.preventDefault();
		}

		useEffect(() => {
			if (activeTransactionSection === 'withdrawals') {
				setActiveTransactionSectionColor('#f4e4b675');
			} else if (activeTransactionSection === 'deposits') {
				setActiveTransactionSectionColor('#a3d5bb75');
			} else if (activeTransactionSection === 'fines') {
				setActiveTransactionSectionColor('#ebc1c575');
			}
		}, [activeTransactionSection]);

		return (
			<div className="pt-2 pt-md-0 pb-3">
				<div className="mb-3">
					<div className="d-flex flex-wrap justify-content-between align-items-center">
						<h2><CashRegister weight='fill' className="me-1 opacity-50" /> Transactions panel</h2>
						<div className="ms-auto">
							<Button variant="primary" onClick={() => { setActiveTransactionSection('withdrawals'); setShowAddExpenseRecord(true) }} className='btn-sm rounded-0 border-end text-light clickDown'><Plus /> Record expenses</Button>
						</div>
					</div>
					<div className="d-lg-flex align-items-center">
						<img src="images/transactions_visual.png" alt="" className='d-none d-lg-block col-md-5' />
						<div className='alert mb-4 rounded-0 smaller fw-light'>
							The transactions panel provides a detailed record of all financial activities, ensuring complete transparency and accountability. Here, you can track and review logs of deposits, withdrawals, and fines, offering a comprehensive view of each member's financial transactions for easy monitoring and management.
						</div>
					</div>
				</div>
				<hr className='mb-4 d-lg-none' />
				<div className='text-gray-700 selective-options' style={{ backgroundColor: activeTransactionSectionColor }}>
					{/* Selectors */}
					<div className="d-flex flex-wrap justify-content-center">
						<div className={`col d-flex flex-column flex-sm-row column-gap-2 p-2 border-top border-bottom border-2 border-warning border-opacity-25 tab-selector ${activeTransactionSection === 'withdrawals' ? 'active' : ''} user-select-none ptr clickDown`}
							style={{ '--_activeColor': '#f4e4b6' }}
							onClick={() => { setActiveTransactionSection('withdrawals'); }}
						>
							<h5 className='mb-0 small'>Expenses</h5>
							<p className='mb-0 fs-75'>( {expenses.length} )</p>
						</div>
						<div className={`col d-flex flex-column flex-sm-row column-gap-2 p-2 border-top border-bottom border-2 border-success border-opacity-25 tab-selector ${activeTransactionSection === 'deposits' ? 'active' : ''} user-select-none ptr clickDown`}
							style={{ '--_activeColor': '#a3d5bb' }}
							onClick={() => { setActiveTransactionSection('deposits'); }}
						>
							<h5 className='mb-0 small'>Deposits</h5>
							<p className='mb-0 fs-75'>( {deposits.length} )</p>
						</div>
						<div className={`col d-flex flex-column flex-sm-row column-gap-2 p-2 border-top border-bottom border-2 border-danger border-opacity-25 tab-selector ${activeTransactionSection === 'fines' ? 'active' : ''} user-select-none ptr clickDown`}
							style={{ '--_activeColor': '#ebc1c5' }}
							onClick={() => { setActiveTransactionSection('fines'); }}
						>
							<h5 className='mb-0 small'>Fines</h5>
							<p className='mb-0 fs-75'>( 2 )</p>
						</div>
					</div>

					{/* Selected content */}
					<div>
						{activeTransactionSection === 'withdrawals' && (
							<>
								<div className='overflow-auto'>
									<table className="table table-hover h-100 properties-table">
										<thead className='table-warning position-sticky top-0 inx-1'>
											<tr>
												<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
												<th className='py-3 text-nowrap text-gray-700' style={{ minWidth: '10rem' }}>Type</th>
												<th className='py-3 text-nowrap text-gray-700'>Amount  <sub className='fs-60'>/RWF</sub></th>
												<th className='py-3 text-nowrap text-gray-700' style={{ maxWidth: '13rem' }} >Comment</th>
												<th className='py-3 text-nowrap text-gray-700'>Date</th>
											</tr>
										</thead>
										<tbody>
											{expenses
												.sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort expenses by date
												.map((item, index) => (
													<tr
														key={index}
														className="small cursor-default clickDown expense-row"
													>
														<td className="ps-sm-3 border-bottom-3 border-end">
															{index + 1}
														</td>
														<td>
															{item.type}
														</td>
														<td>
															{item.amount.toLocaleString()}
														</td>
														<td className="text-nowrap">
															{item.comment}
														</td>
														<td style={{ maxWidth: '13rem' }}>
															{new Intl.DateTimeFormat('en-gb', {
																day: '2-digit',
																month: '2-digit',
																year: 'numeric',
															}).format(new Date(item.date))} {/* Formats the date */}
														</td>
													</tr>
												))
											}
										</tbody>
									</table>
								</div>

								{showAddExpenseRecord &&
									<>
										<div className='position-fixed fixed-top inset-0 bg-black2 py-5 inx-high add-property-form'>
											<div className="container col-md-6 col-lg-5 col-xl-4 peak-borders-b overflow-auto" style={{ animation: "zoomInBack .2s 1", maxHeight: '100%' }}>
												<div className="container h-100 bg-light text-gray-700 px-3">
													<h6 className="sticky-top flex-align-center justify-content-between mb-4 pt-3 pb-2 bg-light text-gray-600 border-bottom text-uppercase">
														<div className='flex-align-center'>
															<CashRegister weight='fill' className="me-1" />
															<span style={{ lineHeight: 1 }}>Record an expense</span>
														</div>
														<div title="Cancel" onClick={() => { setShowAddExpenseRecord(false); setExpenseRecordAmount('') }}>
															<X size={25} className='ptr' />
														</div>
													</h6>

													{/* The form */}
													<form onSubmit={(e) => handleAddExpense(e)} className="px-sm-2 pb-5">
														<div className="mb-3">
															<label htmlFor="expenseType" className="form-label fw-bold">Expense type</label>
															<select id="expenseType" name="expenseType" className="form-select"
																defaultValue=""
																required>
																<option value="" disabled className='p-2 px-3 small text-gray-500'>Select type</option>
																{expensesTypes
																	.map((val, index) => (
																		<option key={index} value={val} className='p-2 px-3 small'>
																			{val}
																		</option>
																	))
																}
															</select>
														</div>
														<div className="mb-3">
															<label htmlFor="expenseAmount" className="form-label fw-bold" required>Expense amount ({expenseRecordAmount !== '' ? Number(expenseRecordAmount).toLocaleString() : ''} RWF )</label>
															<input type="number" id="expenseAmount" name="expenseAmount" className="form-control" required placeholder="Enter amount"
																value={expenseRecordAmount}
																onChange={e => setExpenseRecordAmount(e.target.value)}
															/>
														</div>
														<div className="mb-3">
															<label htmlFor="expenseComment" className="form-label fw-bold" required>Expense comment</label>
															<textarea rows={3} id="expenseComment" name="expenseComment" className="form-control" placeholder="Enter comment"></textarea>
														</div>

														<button type="submit" className="btn btn-sm btn-dark flex-center w-100 mt-3 py-2 px-4 rounded-pill clickDown" id="addExpenseBtn"
														>
															{!isWaitingAdminEditAction ?
																<>Save Record <FloppyDisk size={18} className='ms-2' /></>
																: <>Working <span className="spinner-grow spinner-grow-sm ms-2"></span></>
															}
														</button>
													</form>
												</div>
											</div>
										</div>
									</>
								}
							</>
						)}

						{activeTransactionSection === 'deposits' && (
							<div className='overflow-auto'>
								<table className="table table-hover h-100 properties-table">
									<thead className='table-success position-sticky top-0 inx-1'>
										<tr>
											<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
											<th className='py-3 text-nowrap text-gray-700'>Member</th>
											<th className='py-3 text-nowrap text-gray-700' style={{ minWidth: '10rem' }}>Type</th>
											<th className='py-3 text-nowrap text-gray-700'>Amount  <sub className='fs-60'>/RWF</sub></th>
											<th className='py-3 text-nowrap text-gray-700' style={{ maxWidth: '13rem' }} >Comment</th>
											<th className='py-3 text-nowrap text-gray-700'>Date</th>
										</tr>
									</thead>
									<tbody>
										{deposits
											.sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort expenses by date
											.map((item, index) => (
												<tr
													key={index}
													className="small cursor-default clickDown expense-row"
												>
													<td className="ps-sm-3 border-bottom-3 border-end">
														{index + 1}
													</td>
													<td className="text-nowrap">
														{item.member}
													</td>
													<td>
														{item.type}
													</td>
													<td>
														{item.amount.toLocaleString()}
													</td>
													<td className="text-nowrap">
														{item.comment}
													</td>
													<td style={{ maxWidth: '13rem' }}>
														{new Intl.DateTimeFormat('en-gb', {
															day: '2-digit',
															month: '2-digit',
															year: 'numeric',
														}).format(new Date(item.date))} {/* Formats the date */}
													</td>
												</tr>
											))
										}
									</tbody>
								</table>
							</div>
						)}

						{activeTransactionSection === 'fines' && (
							<div className='overflow-auto'>
								<table className="table table-hover h-100 properties-table">
									<thead className='table-danger position-sticky top-0 inx-1'>
										<tr>
											<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
											<th className='py-3 text-nowrap text-gray-700' style={{ minWidth: '10rem' }}>Member</th>
											<th className='py-3 text-nowrap text-gray-700'>Amount  <sub className='fs-60'>/RWF</sub></th>
											<th className='py-3 text-nowrap text-gray-700'>Date & Interval</th>
											<th className='py-3 text-nowrap text-gray-700' style={{ maxWidth: '13rem' }} >Comment</th>
											<th className='py-3 text-nowrap text-gray-700' style={{ maxWidth: '13rem' }} >Rejection</th>
											<th className='py-3 text-nowrap text-gray-700'>Action</th>
										</tr>
									</thead>
									<tbody>
										<tr
											className={`small cursor-default clickDown fine-row`}
										>
											<td className={`ps-sm-3  border-bottom-3 border-end`}>
												1
											</td>
											<td >
												Alain Mugabe
											</td>
											<td className="d-flex flex-column gap-2 text-muted small" >
												<div>
													<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Loan</h6>
													<span>10,000,000</span>
												</div>
												<div>
													<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Interest</h6>
													<span>50,000</span>
												</div>
											</td>
											<td className='text-nowrap'>
												<div className='d-flex flex-column gap-2 smaller'>
													<span className='fw-bold'>13-11-2024 <CaretRight /> 13-03-2025</span>
													<span>0 Years, 4 Months, 2 Days</span>
												</div>
											</td>
											<td style={{ maxWidth: '13rem' }}>
												Demande de credit
											</td>
											<td style={{ maxWidth: '13rem' }}>
												Insufficient balance
											</td>
											<td className='text-nowrap fs-75'>
												<button className='btn btn-sm btn-outline-secondary rounded-0'>
													<ArrowArcLeft /> Restore
												</button>
											</td>
										</tr>
										<tr
											className={`small cursor-default clickDown loan-row`}
										>
											<td className={`ps-sm-3  border-bottom-3 border-end`}>
												2
											</td>
											<td >
												Bonaventure Nzeyimana
											</td>
											<td className="d-flex flex-column gap-2 text-muted small" >
												<div>
													<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Loan</h6>
													<span>4,000,000</span>
												</div>
												<div>
													<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Interest</h6>
													<span>200,000</span>
												</div>
											</td>
											<td className='text-nowrap'>
												<div className='d-flex flex-column gap-2 smaller'>
													<span className='fw-bold'>13-11-2024 <CaretRight /> 13-03-2025</span>
													<span>0 Years, 4 Months, 2 Days</span>
													<span>6 tranches</span>
												</div>
											</td>
											<td style={{ maxWidth: '13rem' }}>
												Payment will be due on 15th each month
											</td>
											<td style={{ maxWidth: '13rem' }}>
												Some reasons
											</td>
											<td className='text-nowrap fs-75'>
												<button className='btn btn-sm btn-outline-secondary rounded-0'>
													<ArrowArcLeft /> Restore
												</button>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			</div>
		)
	}

	// Reports
	const Reports = () => {

		const [showExportDataDialog, setShowExportDataDialog] = useState(false);
		const [exportFileName, setExportFileName] = useState('exported-file');

		const [activeReportSection, setActiveReportSection] = useState('incomeExpenses');
		useEffect(() => {
			if (activeReportSection === 'incomeExpenses') {
				setExportFileName('Rapport sur les revenus et les dépenses');
			} else if (activeReportSection === 'general') {
				setExportFileName('Rapport général');
			}
		}, [activeReportSection]);

		// Handle exports
		const reportViewRef = useRef();

		return (
			<div className="pt-2 pt-md-0 pb-3">
				<div className="mb-3">
					<h2><Files weight='fill' className="me-1 opacity-50" /> Report panel</h2>
					<div className="d-lg-flex align-items-center">
						<img src="images/reports_visual.png" alt="" className='d-none d-lg-block col-md-5' />
						<div className='alert mb-4 rounded-0 smaller fw-light'>
							The reports panel provides detailed insights into financial activities, including breakdowns of income and expenses and an overview of members' financial status. It also offers export options for further analysis and use.
						</div>
					</div>
					{/* <ul className='list-style-square'>
						<li><b>User Reports</b>: Track active users, their interactions, and feedback</li>
						<li><b>Financial Summaries</b>: Detailed breakdowns of income, expenses, and transactions</li>
						<li><b>Customizable Filters</b>: Generate tailored reports by date, type, or category for specific analyses</li>
						<li><b>Export Options</b>: Download reports in formats like PDF or Excel for further use</li>
					</ul> */}
				</div>
				<hr className='mb-4 d-lg-none' />

				<div ref={reportViewRef} className='mb-3 bg-bodi'>
					<div className="alert alert-info smaller">
						<p className='display-6'>
							{
								activeReportSection === 'incomeExpenses' ?
									<>Rapport sur les revenus et les dépenses</>
									: activeReportSection === 'general' ?
										<>Rapport général</>
										: 'REPORT'
							}
						</p>
						{/* <Calendar size={25} className='me-2' /> {Date()} */}
						<Calendar size={25} className='me-2' /> {new Intl.DateTimeFormat('en-GB', {
							year: 'numeric',
							month: 'numeric',
							day: 'numeric',
							hour12: true,
						}).format(new Date())}
					</div>
					<div className='text-gray-700 selective-options' style={{ backgroundColor: '#a3d5bb75' }}>
						{/* Selectors */}
						<div className="d-flex flex-wrap justify-content-center">
							<div className={`col d-flex flex-column flex-sm-row column-gap-2 p-2 border-top border-bottom border-2 border-success border-opacity-25 tab-selector ${activeReportSection === 'incomeExpenses' ? 'active' : ''} user-select-none ptr clickDown`}
								style={{ '--_activeColor': '#a3d5bb' }}
								onClick={() => { setActiveReportSection('incomeExpenses'); }}
							>
								<h5 className='mb-0 small'>Income & Expenses</h5>
							</div>
							<div className={`col d-flex flex-column flex-sm-row column-gap-2 p-2 border-top border-bottom border-2 border-success border-opacity-25 tab-selector ${activeReportSection === 'general' ? 'active' : ''} user-select-none ptr clickDown`}
								style={{ '--_activeColor': '#a3d5bb' }}
								onClick={() => { setActiveReportSection('general'); }}
							>
								<h5 className='mb-0 small'>General report</h5>
							</div>
						</div>

						{/* Selected content */}
						<div>
							{activeReportSection === 'incomeExpenses' && (
								<>
									<div className='overflow-auto'>
										<table className="table table-hover h-100 properties-table">
											<thead className='table-success position-sticky top-0 inx-1'>
												<tr>
													<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
													<th className='py-3 text-nowrap text-gray-700'>Libelle</th>
													<th className='py-3 text-nowrap text-gray-700'>Montant <sub className='fs-60'>/RWF</sub></th>
												</tr>
											</thead>
											<tbody>
												{/* Sort by Income to Expenses, and low to max amount */}
												{incomeExpenses
													.filter((item) => item.type === 'income')
													.sort((a, b) => a.amount - b.amount)
													.concat(
														incomeExpenses
															.filter((item) => item.type === 'expense')
															.sort((a, b) => a.amount - b.amount)
													)
													.map((item, index) => (
														<tr
															key={index}
															className="small cursor-default clickDown expense-row"
														>
															<td className={`ps-sm-3 border-end ${item.type === 'income' ? 'text-success' : 'text-warning-emphasis'}`}>
																{index + 1}
															</td>
															<td className={`${item.type === 'income' ? 'text-success' : 'text-warning-emphasis'}`}>
																{item.label}
															</td>
															<td className={`${item.type === 'income' ? 'text-success' : 'text-warning-emphasis'}`}>
																<CurrencyText amount={item.amount} />
															</td>
														</tr>
													))
												}
											</tbody>
										</table>
									</div>
								</>
							)}

							{activeReportSection === 'general' && (
								<>
									<div className='overflow-auto'>
										<table className="table table-hover h-100 properties-table">
											<thead className='table-success position-sticky top-0 inx-1'>
												<tr>
													<th className='py-3 text-nowrap text-gray-700'>Actif</th>
													<th className='py-3 text-nowrap text-gray-700'>Montant <sub className='fs-60'>/RWF</sub></th>
													<th className='py-3 text-nowrap text-gray-700'>Passif</th>
													<th className='py-3 text-nowrap text-gray-700'>Montant <sub className='fs-60'>/RWF</sub></th>
												</tr>
											</thead>
											<tbody>
												<tr className="small cursor-default clickDown general-report-row"
												>
													<td className="ps-sm-3 border-bottom-3 border-end fw-bold">
														Balance
													</td>
													<td className="text-nowrap fw-bold">
														<CurrencyText amount={generalReport.balance} />
													</td>
													<td></td>
													<td></td>
												</tr>
												{generalReport.report
													.map((item, index) => (
														<tr
															key={index}
															className="small cursor-default clickDown general-report-row"
														>
															<td className="ps-sm-3">
																<b>{index + 1}</b>. {item.member}
															</td>
															<td className="text-nowrap">
																Credit: <b className='text-gray-700'><CurrencyText amount={item.credit} smallCurrency /></b>
															</td>
															<td>
																{item.member}
															</td>
															<td className='text-nowrap'>
																Part: <CurrencyText amount={item.part} boldAmount smallCurrency className='text-gray-700' /> | Social: <CurrencyText amount={item.social} boldAmount smallCurrency className='text-gray-700' />
															</td>
														</tr>
													))
												}
												<tr className="small cursor-default clickDown general-report-row fw-bold"
													style={{ borderTopWidth: '2px' }} >
													<td></td>
													<td></td>
													<td>
														Cotisation + Social
													</td>
													<td className="text-nowrap">
														<CurrencyText amount={generalReport.cotisationAndSocial} />
													</td>
												</tr>
												<tr className="small cursor-default clickDown general-report-row fw-bold"
												>
													<td></td>
													<td></td>
													<td>
														Verify
													</td>
													<td className="text-nowrap">
														<CurrencyText amount={generalReport.verify} />
													</td>
												</tr>
												<tr className="small cursor-default clickDown general-report-row fw-bold fs-5"
												>
													<td className="ps-sm-3">General Total:</td>
													<td>
														<CurrencyText amount={generalReport.generalTotal} />
													</td>
													<td>General Total:</td>
													<td className="text-nowrap">
														<CurrencyText amount={generalReport.generalTotal} />
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</>
							)}
							<div className="d-flex small px-2">
								<CashRegister size={30} weight='duotone' className='me-2 opacity-50' />
								<div className='border-start border-secondary border-opacity-25 ps-2'>
									<p className='mb-0'>Created using IKIMINA INGOBOKA system</p>
									<p>Done by <b>Accountant Alain Mugabe</b></p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Exporter */}
				<div className='small'>
					<div className="d-flex flex-wrap gap-2">
						<button className="btn btn-sm bg-primaryColor text-light rounded-0 clickDown"
							onClick={() => setShowExportDataDialog(true)}
						>
							<Files size={22} /> Generate Report
						</button>
						<p className='p-2 smaller'>
							<Info className='me-1' />
							Click the button to generate today's <b>{
								activeReportSection === 'incomeExpenses' ?
									'income and expense'
									: activeReportSection === 'general' ?
										'general'
										: ''
							}</b> report.
						</p>
					</div>
				</div>

				{/* Export report tables */}
				<ExportDomAsFile
					show={showExportDataDialog}
					container={reportViewRef}
					exportName={exportFileName}
					onClose={() => { setShowExportDataDialog(false) }}
				/>
			</div>
		)
	}

	// Messages
	const Messages = () => {
		return (
			<section>
				**Messages & Notifications**
				- Send updates to members about savings, fines, or loan approvals.
				- Handle inquiries from members.
				- Manage email and SMS notifications.
			</section>
		)
	}

	// Settings
	const Settings = () => {
		return (
			<section>
				- Manage system-wide configurations (interest rates, fine rates, loan terms).
				- Configure payment gateways.
				- Adjust admin privileges and roles.
			</section>
		)
	}

	// Audit Log
	const AuditLogs = () => {
		return (
			<>
				<section>
					- Track changes made by admins or staff to maintain transparency.
					- Log edits to member details, savings, loans, or settings.
				</section>
				<DateLocaleFormat />
			</>
		)
	}

	// Render content
	const renderContent = () => {
		switch (activeSection) {
			case "dashboard":
				return <Dashboard />;
			case "members":
				return <Members />;
			case "savings":
				return <Savings />;
			case "interest":
				return <Interest />;
			case "credits":
				return <Credit />;
			case "transactions":
				return <Transactions />;
			case "reports":
				return <Reports />;
			case "messages":
				return <Messages />;
			case "settings":
				return <Settings />;
			case "auditLogs":
				return <AuditLogs />;
			default:
				return <Dashboard />;
		}
	};

	// Set notifications

	const [adminHasNewNotifications, setAdminHasNewNotifications] = useState(true);

	return (
		<>
			<MyToast show={showToast} message={toastMessage} type={toastType} selfClose onClose={() => setShowToast(false)} />
			<header className="navbar navbar-light sticky-top flex-md-nowrap py-0 admin-header">
				<div className='nav-item navbar-brand col-12 col-md-3 col-xl-2 d-flex align-items-center me-0 px-2'>
					<div className="me-2 logo">
						<img src="logo.png" alt="logo" className="rounded-circle logo"></img>
					</div>
					<small className='fs-70 text-gray-400'>
						INGOBOKA
					</small>
					<div className="d-flex gap-2 d-md-none ms-auto me-2 text-light" style={{ '--_activeColor': 'var(--bs-gray-500)' }}>
						<button className={`nav-link px-2 ${adminHasNewNotifications ? 'active-with-dot' : ''} text-gray-400 rounded-0 clickDown`} title='Notifications'>
							<BellSimple weight={adminHasNewNotifications ? 'fill' : undefined} size={20}
								style={{ animation: adminHasNewNotifications ? 'shakeX 10s infinite' : 'unset' }}
							/>
						</button>
						<button ref={sideNavbarTogglerRef} className="text-gray-400 rounded-0 shadow-none bounceClick navbar-toggler" type="button" aria-controls="sidebarMenu" aria-label="Toggle navigation" onClick={() => setSideNavbarIsFloated(!sideNavbarIsFloated)}>
							<List />
						</button>
					</div>
				</div>
				<div className='d-none d-md-flex flex-grow-1 border-bottom py-1'>
					<div className="me-3 ms-auto navbar-nav">
						<div className="nav-item d-flex gap-2 text-nowrap small" style={{ '--_activeColor': 'var(--primaryColor)' }}>
							<button className={`nav-link px-2 ${adminHasNewNotifications ? 'bg-gray-300 text-primaryColor active-with-dot' : 'text-gray-600'} rounded-pill clickDown`} title='Notifications'>
								<BellSimple weight={adminHasNewNotifications ? 'fill' : undefined} size={20}
									style={{ animation: adminHasNewNotifications ? 'shakeX 10s infinite' : 'unset' }}
								/>
							</button>
							<button className="nav-link px-2 text-gray-600 rounded-pill clickDown" title='Sign out' >
								<SignOut size={20} />
							</button>
						</div>
					</div>
					<div className="d-flex align-items-center me-3 border-light border-opacity-25">
						<div className='ms-auto d-grid pb-1'>
							<span className='ms-auto smaller'>Mugabe Alain</span>
							<span className='ms-auto fs-70 opacity-75' style={{ lineHeight: 1 }}>Accountant</span>
						</div>
						<img src="images/members/m_alain.jpg" alt="User" className='w-2_5rem ratio-1-1 object-fit-cover ms-2 d-none d-md-block border border-3 border-light bg-light rounded-circle' />
					</div>
				</div>
			</header>
			<main className="container-fluid">
				<div className="row">
					{/* Sidebar Navigation */}
					<nav className={`col-12 col-md-3 col-xl-2 d-md-block border-end overflow-y-auto sidebar ${sideNavbarIsFloated ? 'floated bg-black3' : ''}`} id="sidebarMenu">
						<div ref={sideNavbarRef} className={`position-sticky top-0 h-fit pt-2 pt-md-3 pb-3 col-8 col-sm-5 col-md-12 ${sideNavbarIsFloated ? 'peak-borders-b' : ''}`}>

							<div className="d-flex align-items-center d-md-none mb-3 px-3 pb-2 border-bottom border-light border-opacity-25">
								<div className='ms-auto d-grid pb-1'>
									<span className='ms-auto smaller'>Mugabe Alain</span>
									<span className='ms-auto fs-70 opacity-75' style={{ lineHeight: 1 }}>Accountant</span>
								</div>
								<img src="images/members/m_alain.jpg" alt="User" className='w-2_5rem ratio-1-1 object-fit-cover ms-2 border border-3 border-secondary bg-gray-600 rounded-circle' />
							</div>

							<ul className="nav flex-column">
								<li className={`nav-item mb-2 ${activeSection === 'dashboard' ? 'active' : ''}`}
									onClick={() => { setActiveSection("dashboard"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<ChartPieSlice size={20} weight='fill' className="me-2" /> Dashboard
									</button>
								</li>
								<li className={`nav-item mb-2 ${activeSection === 'members' ? 'active' : ''}`}
									onClick={() => { setActiveSection("members"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<Users size={20} weight='fill' className="me-2" /> Members
									</button>
								</li>
								<li className={`nav-item mb-2 ${activeSection === 'savings' ? 'active' : ''}`}
									onClick={() => { setActiveSection("savings"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<Coin size={20} weight='fill' className="me-2" /> Savings
									</button>
								</li>
								<li className={`nav-item mb-2 ${activeSection === 'interest' ? 'active' : ''}`}
									onClick={() => { setActiveSection("interest"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<Coins size={20} weight='fill' className="me-2" /> Interest
									</button>
								</li>
								<li className={`nav-item mb-2 ${activeSection === 'credits' ? 'active' : ''}`}
									onClick={() => { setActiveSection("credits"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<Blueprint size={20} weight='fill' className="me-2" /> Credits
									</button>
								</li>
								<li className={`nav-item mb-2 ${activeSection === 'transactions' ? 'active' : ''}`}
									onClick={() => { setActiveSection("transactions"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<CashRegister size={20} weight='fill' className="me-2" /> Transactions
									</button>
								</li>
								<li className={`nav-item ${activeSection === 'reports' ? 'active' : ''}`}
									onClick={() => { setActiveSection("reports"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<Files size={20} weight='fill' className="me-2" /> Reports
									</button>
								</li>
								{/* <li className={`nav-item mb-2 ${activeSection === 'messages' ? 'active' : ''}`}
									onClick={() => { setActiveSection("messages"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<ChatDots size={20} weight='fill' className="me-2" /> Messages
									</button>
									<span
										className='r-middle-m h-1rem flex-center me-3 px-2 bg-gray-300 text-gray-900 fs-60 fw-medium rounded-pill'
										style={{ lineHeight: 1 }}>
										5
									</span>
								</li> */}

								<hr />

								<li className={`nav-item mb-2 ${activeSection === 'auditLogs' ? 'active' : ''}`}
									onClick={() => { setActiveSection("auditLogs"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<Notebook size={20} weight='fill' className="me-2" /> Audit Logs
									</button>
								</li>

								<li className={`nav-item mb-2 ${activeSection === 'settings' ? 'active' : ''}`}
									onClick={() => { setActiveSection("settings"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<Gear size={20} weight='fill' className="me-2" /> Settings
									</button>
								</li>

								<li className={`nav-item mb-3 d-md-none`}>
									<button className="nav-link w-100">
										<SignOut size={20} weight='fill' className="me-2" /> Sign out
									</button>
								</li>
							</ul>
						</div>
					</nav>

					{/* Content Area */}
					<div className="col-md-9 col-xl-10 ms-sm-auto px-md-4 py-2">
						{renderContent()}

						{/* Reply to messages */}

					</div>

				</div>

				{/* Fixed components */}

				{/* Property preview card */}
				{/* <BottomFixedCard
                show={showSelectedPropertyInfo}
                content={[
                    <PropertyPreview />
                ]}
                blurBg
                closeButton={<X size={35} weight='bold' className='p-2' />}
                onClose={() => setShowSelectedPropertyInfo(false)}
                className="pb-3"
            /> */}
			</main>
		</>
	)
}

export default Admin;
