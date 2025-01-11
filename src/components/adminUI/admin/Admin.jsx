import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Button, Form } from "react-bootstrap";
import './admin.css';
import MyToast from '../../common/Toast';
import { ArrowArcLeft, ArrowClockwise, BellSimple, Blueprint, Calendar, CaretRight, CashRegister, ChartBar, ChartPie, ChartPieSlice, Check, Coin, Coins, CurrencyDollarSimple, DotsThreeOutline, Files, FloppyDisk, Gear, Info, List, Notebook, Pen, Plus, Receipt, ReceiptX, SignOut, Table, Upload, User, Users, X } from '@phosphor-icons/react';
import { dashboardData, deposits, expenses, expensesTypes, generalReport, incomeExpenses, membersData } from '../../../data/data';
import ExportDomAsFile from '../../common/exportDomAsFile/ExportDomAsFile';
import DateLocaleFormat from '../../common/dateLocaleFormats/DateLocaleFormat';
import CurrencyText from '../../common/CurrencyText';
import LoadingIndicator from '../../LoadingIndicator';
import { cError, cLog, normalizedLowercaseString, printDatesInterval } from '../../../scripts/myScripts';
import FormatedDate from '../../common/FormatedDate';
import FetchError from '../../common/FetchError';
import useCustomDialogs from '../../common/hooks/useCustomDialogs';
import ActionPrompt from '../../common/actionPrompt/ActionPrompt';
import ConfirmDialog from '../../common/confirmDialog/ConfirmDialog';
import NotFount from '../../common/NotFount';
import JsonJsFormatter from '../../common/JsonJsFormatter';

const Admin = () => {

	// Custom hooks
	const {
		// Toast
		showToast,
		setShowToast,
		toastMessage,
		toastType,
		toast,

		// Confirm Dialog
		showConfirmDialog,
		confirmDialogMessage,
		confirmDialogAction,
		confirmDialogActionText,
		confirmDialogCloseText,
		confirmDialogCloseCallback,
		confirmDialogType,
		confirmDialogActionWaiting,
		setConfirmDialogActionWaiting,
		customConfirmDialog,
		resetConfirmDialog,

		// Prompt
		showPrompt,
		promptMessage,
		promptType,
		promptInputType,
		promptSelectInputOptions,
		promptInputValue,
		promptInputPlaceholder,
		promptAction,
		promptActionWaiting,
		setPromptActionWaiting,
		customPrompt,
		resetPrompt,
	} = useCustomDialogs();

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

	/**
	 * Members
	 */

	const [allMembers, setAllMembers] = useState([]);
	const [membersToShow, setMembersToShow] = useState([]);
	const [loadingMembers, setLoadingMembers] = useState(false);
	const [errorLoadingMembers, setErrorLoadingMembers] = useState(false);

	const totalCotisation = allMembers.reduce((sum, m) => (sum + (m.shares * 20000)), 0);
	const totalSocial = allMembers.reduce((sum, m) => sum + m.social, 0);

	// Fetch members
	const fetchMembers = async () => {
		try {
			setLoadingMembers(true);
			const response = await fetch(`${BASE_URL}/users`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
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

	/**
	 * Credits
	 */

	const [allCredits, setAllCredits] = useState([]);
	const [creditsToShow, setCreditsToShow] = useState([]);
	const [loadingCredits, setLoadingCredits] = useState(false);
	const [errorLoadingCredits, setErrorLoadingCredits] = useState(false);

	// Fetch credits
	const fetchCredits = async () => {
		try {
			setLoadingCredits(true);
			const response = await fetch(`${BASE_URL}/credits`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			setAllCredits(data);
			setCreditsToShow(data);
			setErrorLoadingCredits(null);
		} catch (error) {
			setErrorLoadingCredits("Failed to load credits. Click the button to try again.");
			console.error("Error fetching credits:", error);
		} finally {
			setLoadingCredits(false);
		}
	};

	useEffect(() => {
		fetchCredits();
	}, []);

	/**
	 * Loans
	 */

	const [allLoans, setAllLoans] = useState([]);
	const [loansToShow, setLoansToShow] = useState(allLoans);
	const [loadingLoans, setLoadingLoans] = useState(false);
	const [errorLoadingLoans, setErrorLoadingLoans] = useState(false);

	// Fetch loans
	const fetchLoans = async () => {
		try {
			setLoadingLoans(true);
			const response = await fetch(`${BASE_URL}/loans`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			console.log(data);
			setAllLoans(data);
			setLoansToShow(data);
			setErrorLoadingLoans(null);
		} catch (error) {
			setErrorLoadingLoans("Failed to load loans. Click the button to try again.");
			console.error("Error fetching loans:", error);
		} finally {
			setLoadingLoans(false);
		}
	};

	useEffect(() => {
		fetchLoans();
	}, []);

	/**
	 * Records
	 */

	const [allRecords, setAllRecords] = useState([]);
	const [recordsToShow, setRecordsToShow] = useState(allRecords);
	const [loadingRecords, setLoadingRecords] = useState(false);
	const [errorLoadingRecords, setErrorLoadingRecords] = useState(false);

	// Fetch records
	const fetchRecords = async () => {
		try {
			setLoadingRecords(true);
			const response = await fetch(`${BASE_URL}/records`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			setAllRecords(data);
			setRecordsToShow(data);
			setErrorLoadingRecords(null);
		} catch (error) {
			setErrorLoadingRecords("Failed to load records. Click the button to try again.");
			console.error("Error fetching records:", error);
		} finally {
			setLoadingRecords(false);
		}
	};

	useEffect(() => {
		fetchRecords();
	}, []);

	// const [activeSection, setActiveSection] = useState("dashboard");
	// const [activeSection, setActiveSection] = useState("messages");
	// const [activeSection, setActiveSection] = useState("members");
	// const [activeSection, setActiveSection] = useState("savings");
	const [activeSection, setActiveSection] = useState("credits");
	// const [activeSection, setActiveSection] = useState("interest");
	// const [activeSection, setActiveSection] = useState("transactions");
	// const [activeSection, setActiveSection] = useState("reports");
	// const [activeSection, setActiveSection] = useState("settings");
	// const [activeSection, setActiveSection] = useState("auditLogs");

	const [isWaitingFetchAction, setIsWaitingFetchAction] = useState(false);
	const [errorWithFetchAction, setErrorWithFetchAction] = useState(null);

	/**
	 * Sections
	 */

	// Dashboard
	const Dashboard = () => {

		const [showExportDataDialog, setShowExportDataDialog] = useState(false);

		const accountingDashboardRef = useRef();

		// const totalCotisation = allMembers.reduce((sum, item) => sum + item.cotisation, 0);
		// const totalSocial = allMembers.reduce((sum, item) => sum + item.social, 0);
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

		// let labelvalue;
		// switch (true) {
		// 	case 'Cotisation':
		// 		labelvalue = totalCotisation
		// 		break;

		// 	default:
		// 		break;
		// }

		return (
			<>

				<div ref={accountingDashboardRef} className="container py-4 bg-bodi">
					<h2 className="mb-3 text-center text-uppercase text-primaryColor">Accounting Dashboard</h2>
					{/* <div className='flex-align-center mb-3'>
						<hr className='flex-grow-1 my-0' />
						<CurrencyDollarSimple size={45} className='mx-2 p-2 text-gray-500 border border-2 border-secondary border-opacity-25 rounded-circle' />
						<hr className='flex-grow-1 my-0' />
					</div>
					<div className="d-lg-flex align-items-center">
						<img src="images/dashboard_visual.png" alt="" className='col-md-5' />
						<div className='alert mb-4 rounded-0 smaller fw-light'>
							This numerical report provides a financial status overview for IKIMINA INGOBOKA saving management system. It highlights key metrics, including contributions, social funds, loans disbursed, interest receivables, paid capital, and other financial indicators. The report reflects the financial management system's performance, tracking transactions from stakeholder contributions, savings, investments, and other financial activities, all aligned with the system's saving balance and agreements established among its members.
						</div>
					</div> */}
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
		const [membersToShow, setMembersToShow] = useState(allMembers);
		const [memberSearchValue, setMemberSearchValue] = useState('');

		// Search members
		const memberSearcherRef = useRef();

		const filterMembersBySearch = useCallback(() => {
			const searchString = normalizedLowercaseString(memberSearchValue).trim();

			if (searchString) {
				const filteredMembers = allMembers.filter((val) => {
					return (
						(val.husbandFirstName &&
							normalizedLowercaseString(val.husbandFirstName)
								.includes(searchString)) ||
						(val.husbandLastName &&
							normalizedLowercaseString(val.husbandLastName)
								.includes(searchString)) ||
						(val.wifeFirstName &&
							normalizedLowercaseString(val.wifeFirstName)
								.includes(searchString)) ||
						(val.wifeLstName &&
							normalizedLowercaseString(val.wifeLstName)
								.includes(searchString)) ||
						(val.husbandEmail &&
							val.husbandEmail.toLowerCase().includes(searchString)) ||
						(val.wifeEmail &&
							val.wifeEmail.toLowerCase().includes(searchString)) ||
						(val.husbandPhone &&
							val.husbandPhone.replace(/[ ()+]/g, '').toLowerCase().includes(searchString)) ||
						(val.wifePhone &&
							val.wifePhone.replace(/[ ()+]/g, '').toLowerCase().includes(searchString))
					);
				});

				setMembersToShow(filteredMembers);
			}
		}, [memberSearchValue, allMembers]);

		const resetMembers = () => {
			setMembersToShow(allMembers);
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
					{!loadingMembers && errorLoadingMembers && (
						<FetchError
							errorMessage={errorLoadingMembers}
							refreshFunction={() => fetchMembers()}
							className="mb-5 mt-4"
						/>
					)}
					{!loadingMembers && !errorLoadingMembers && membersToShow.length === 0 && (
						<NotFount
							notFoundMessage="No member found"
							icon={<Users size={80} className="text-center w-100 mb-3 opacity-50" />}
							refreshFunction={resetMembers}
						/>
					)}
					{!loadingMembers && !errorLoadingMembers && membersToShow.length > 0 && (
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
							{membersToShow
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
		const [savingsToShow, setSavingsToShow] = useState(allMembers);
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
				setSavingsToShow(filteredsavings);
			}
		}, [savingSearchValue]);

		const resetSavings = () => {
			setSavingsToShow(allMembers);
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

		// Handle add savings
		const handleAddSaving = async (id) => {
			if (!savingRecordAmount || Number(savingRecordAmount) <= 0) {
				return toast({ message: 'Enter a valid saving amount', type: 'gray-700' });
			}

			try {
				setIsWaitingFetchAction(true);

				const response = await fetch(`${BASE_URL}/member/${id}/${savingRecordType}`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						savingAmount: savingRecordAmount,
						comment: savingRecordType[0].toUpperCase() + savingRecordType.slice(1)
					}),
				});

				// Fetch error
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Error adding savings');
				}

				// Successful fetch
				const data = await response.json();
				toast({ message: data.message, type: "dark" });
				setShowAddSavingRecord(false);
				setErrorWithFetchAction(null);
				fetchMembers(); // Ensure this fetches the updated member list
				fetchRecords(); // Uncomment if you want to refresh records as well
			} catch (error) {
				setErrorWithFetchAction(error);
				cError("Error adding savings:", error);
				toast({ message: error.message || "An unknown error occurred", type: "danger" });
			} finally {
				setIsWaitingFetchAction(false);
			}
		};

		// const [shares, setShares] = useState(false);
		// const [showEditSharesRecord, setShowEditSharesRecord] = useState(false);

		// // Handle add shares
		// const handleEditShares = async (id) => {
		// 	if (!shares || Number(shares) <= 0) {
		// 		return toast({ message: 'Enter a valid number of shares', type: 'gray-700' });
		// 	}

		// 	try {
		// 		setIsWaitingFetchAction(true);

		// 		const response = await fetch(`${BASE_URL}/member/${id}/shares`, {
		// 			method: 'POST',
		// 			headers: { 'Content-Type': 'application/json' },
		// 			body: JSON.stringify({
		// 				shares,
		// 				comment: shares[0].toUpperCase() + shares.slice(1),
		// 			}),
		// 		});

		// 		// Fetch error
		// 		if (!response.ok) {
		// 			const errorData = await response.json();
		// 			throw new Error(errorData.message || 'Error updating shares');
		// 		}

		// 		// Successful fetch
		// 		const data = await response.json();
		// 		toast({ message: data.message, type: "dark" });
		// 		setShowEditSharesRecord(false); // Adjust based on your UI logic
		// 		setErrorWithFetchAction(null);
		// 		fetchMembers(); // Ensure the member data is updated
		// 		// fetchRecords(); // Uncomment if records need to be refreshed
		// 	} catch (error) {
		// 		setErrorWithFetchAction(error);
		// 		cError("Error updating shares:", error);
		// 		toast({ message: error.message || "An unknown error occurred", type: "danger" });
		// 	} finally {
		// 		setIsWaitingFetchAction(false);
		// 	}
		// };

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
					{!loadingMembers && errorLoadingMembers && (
						<FetchError
							errorMessage={errorLoadingMembers}
							refreshFunction={() => fetchMembers()}
							className="mb-5 mt-4"
						/>
					)}
					{!loadingMembers && !errorLoadingMembers && savingsToShow.length === 0 && (
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
					{!loadingMembers && !errorLoadingMembers && savingsToShow.length > 0 && (
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
								{savingsToShow
									.sort((a, b) => a.husbandFirstName.localeCompare(b.husbandFirstName))
									.map((member, index) => {
										const { husbandFirstName, husbandLastName, husbandAvatar, shares, cotisation, social } = member;
										const cotisationAmount = shares * 20000;

										return (
											<div key={index} className='col-lg-6 px-lg-3'>
												<div className="position-relative mb-3 my-5 px-2 pt-5 border-top border-3 border-secondary border-opacity-25 text-gray-800 member-element"
												>
													<div className="position-absolute top-0 me-3 d-flex gap-3"
														style={{ right: 0, translate: "0 -50%" }}
													>
														<img src={husbandAvatar}
															alt={`${husbandFirstName.slice(0, 1)}.${husbandLastName}`}
															className="w-5rem ratio-1-1 object-fit-cover p-1 border border-3 border-secondary border-opacity-25 bg-light rounded-circle"
														/>
													</div>
													<div className="px-lg-2">
														<h5 className="mb-3 fs-4">{`${husbandFirstName} ${husbandLastName}`}</h5>
														<ul className="list-unstyled text-gray-700 px-2 smaller">
															<li className="py-1 w-100">
																<span className="flex-align-center">
																	<b className='fs-5'>{shares} Shares</b>
																	<span className='ms-3 text-primary flex-align-center ptr clickDown' title='Edit multiple shares'><Pen size={22} className='me-2' /> Umuhigo</span>
																</span>
															</li>
															<li className="py-1 d-table-row">
																<span className='d-table-cell border-start border-secondary ps-2'>Cotisation:</span> <span className='d-table-cell ps-2'>{cotisation.toLocaleString()} RWF</span>
															</li>
															<li className="py-1 d-table-row">
																<span className='d-table-cell border-start border-secondary ps-2'>Social:</span> <span className='d-table-cell ps-2'>{social.toLocaleString()} RWF</span>
															</li>
															<li className="py-1 fs-5 d-table-row">
																<b className='d-table-cell'>Total:</b> <span className='d-table-cell ps-2'>{(cotisation + social).toLocaleString()} RWF</span>
															</li>
														</ul>
														<button className="btn btn-sm btn-outline-primary w-100 flex-center rounded-0 clickDown"
															onClick={() => { setSelectedMember(member); setShowAddSavingRecord(true) }}
														><Plus className='me-1' /> Save amount</button>
													</div>
												</div>
											</div>
										)
									})
								}
							</div>

							{showAddSavingRecord &&
								<>
									<div className='position-fixed fixed-top inset-0 bg-black2 py-5 inx-high add-property-form'>
										<div className="container col-md-6 col-lg-5 col-xl-4 peak-borders-b overflow-auto" style={{ animation: "zoomInBack .2s 1", maxHeight: '100%' }}>
											<div className="px-3 bg-light text-gray-700">
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
												<form onSubmit={(e) => e.preventDefault()} className="px-sm-2 pb-5">
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
														onClick={() => handleAddSaving(selectedMember.id)}
													>
														{!isWaitingFetchAction ?
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

		const totalShares = 818;
		const totalBoughtShares = allMembers.reduce((sum, item) => sum + item.shares, 0);
		const interestToReceive = dashboardData
			.filter((item) => item.label === "Interest Receivable")
			.map((item) => item.value);
		let totalSharesPercentage = 0;
		let totalMonetaryInterest = 0;
		let totalInterestReceivable = 0;
		let totalInterestRemains = 0;

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
						<div className="d-flex flex-wrap gap-2 ms-lg-auto mb-2">
							<div className='col'>
								<div className='flex-align-center text-muted border-bottom'><ChartPie className='me-1 opacity-50' /> <span className="text-nowrap">All shares</span></div>
								<div className='text-center bg-bodi fs-6'>{totalShares}</div>
							</div>
							<div className='col'>
								<div className='flex-align-center text-muted border-bottom'><Coins className='me-1 opacity-50' /> <span className="text-nowrap">Interest receivable</span></div>
								<div className='text-center bg-bodi fs-6'><CurrencyText amount={interestToReceive} /></div>
							</div>
						</div>

						<Calendar size={25} className='me-2' /> Année {new Date().getFullYear()}
					</div>
					<div className='overflow-auto mb-5'>
						<table className="table table-hover h-100 properties-table">
							<thead className='table-success position-sticky top-0 inx-1'>
								<tr>
									<th className='py-3 text-nowrap text-gray-700'>N°</th>
									<th className='py-3 text-nowrap text-gray-700'>Member</th>
									<th className='py-3 text-nowrap text-gray-700'>Shares</th>
									<th className='py-3 text-nowrap text-gray-700'>Share % to {totalShares}</th>
									<th className='py-3 text-nowrap text-gray-700'>Interest <sub className='fs-60'>/RWF</sub></th>
									<th className='py-3 text-nowrap text-gray-700'>Receivable<sub className='fs-60'>/RWF</sub></th>
									<th className='py-3 text-nowrap text-gray-700'>Remains<sub className='fs-60'>/RWF</sub></th>
									<th className='py-3 text-nowrap text-gray-700'>Status</th>
								</tr>
							</thead>
							<tbody>
								{allMembers
									.sort((a, b) => a.husbandFirstName.localeCompare(b.husbandFirstName))
									.map((item, index) => {
										const memberNames = `${item.husbandFirstName} ${item.husbandLastName}`;
										const sharesProportion = (item.shares / totalBoughtShares);

										const sharesPercentage = (sharesProportion * 100).toFixed(3);
										// Actual interest = (Shares percentage  * Total interest receivable)
										const interest = sharesProportion * Number(interestToReceive);
										// Interest to receive => 20,000 multiples of Actual interest
										const interestReceivable = Math.floor((interest) / 20000) * 20000;
										const interestRemains = interest - interestReceivable;

										totalSharesPercentage += Number(sharesPercentage);
										totalMonetaryInterest += Number(interest);
										totalInterestReceivable += interestReceivable;
										totalInterestRemains += interestRemains;

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
													{sharesPercentage} %
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
										<div className="d-grid">
											{totalBoughtShares}
											 {/* <span className="fs-60">of {totalShares} shares</span> */}
										</div>
									</td>
									<td className="text-nowrap">
										<div className="d-grid">
											<span>{totalSharesPercentage.toFixed(3)} <span className="fs-60">%</span></span>
											{/* <span className="fs-60">of {totalShares} shares</span> */}
										</div>
									</td>
									<td className="text-nowrap fw-bold">
										<CurrencyText amount={totalMonetaryInterest} smallCurrency />
									</td>
									<td className="text-nowrap fw-bold text-success">
										<CurrencyText amount={totalInterestReceivable} smallCurrency />
									</td>
									<td className="text-nowrap">
										<CurrencyText amount={totalInterestRemains} smallCurrency />
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
		const [membersToShow, setMembersToShow] = useState(allMembers || []);
		const [memberSearchValue, setMemberSearchValue] = useState('');

		// Search members
		const memberSearcherRef = useRef();

		const filterMembersBySearch = useCallback(() => {
			const searchString = normalizedLowercaseString(memberSearchValue).trim();

			if (searchString) {
				const filteredMembers = allMembers.filter((val) => {
					return (
						(val.husbandFirstName &&
							normalizedLowercaseString(val.husbandFirstName)
								.includes(searchString)) ||
						(val.husbandLastName &&
							normalizedLowercaseString(val.husbandLastName)
								.includes(searchString)) ||
						(val.wifeFirstName &&
							normalizedLowercaseString(val.wifeFirstName)
								.includes(searchString)) ||
						(val.wifeLstName &&
							normalizedLowercaseString(val.wifeLstName)
								.includes(searchString)) ||
						(val.husbandEmail &&
							val.husbandEmail.toLowerCase().includes(searchString)) ||
						(val.wifeEmail &&
							val.wifeEmail.toLowerCase().includes(searchString)) ||
						(val.husbandPhone &&
							val.husbandPhone.replace(/[ ()+]/g, '').toLowerCase().includes(searchString)) ||
						(val.wifePhone &&
							val.wifePhone.replace(/[ ()+]/g, '').toLowerCase().includes(searchString))
					);
				});

				setMembersToShow(filteredMembers);
			}
		}, [memberSearchValue, allMembers]);

		const resetMembers = () => {
			setMembersToShow(allMembers);
		}

		// Reset members
		useEffect(() => {
			if (memberSearchValue === '') {
				resetMembers();
			}
		}, [memberSearchValue]);

		// Show credits per member
		const [showSelectedMemberCredits, setShowSelectedMemberCredits] = useState(false);
		const [selectedMember, setSelectedMember] = useState(null);

		// Show credits per member
		const [showBackfillPlanCard, setShowBackfillPlanCard] = useState(false);
		const [selectedCredit, setSelectedCredit] = useState([]);
		const [associatedMember, setAssociatedMember] = useState([]);
		// cLog(associatedMember);

		useEffect(() => {
			if (selectedCredit.length !== 0) {
				const id = selectedCredit.memberId;
				setAssociatedMember(allMembers.filter(m => m.id === id));
			}
		}, [selectedCredit,]);

		// handle rejecting a credit
		const rejectCreditRequest = async (id) => {
			try {
				setIsWaitingFetchAction(true);
				const response = await fetch(`${BASE_URL}/credit/${id}/reject`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ status: 'rejected', rejectionMessage: promptInputValue.current }),
				});

				// Fetch error
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Error rejecting credit request');
				}
				// Successfull fetch
				const data = await response.json();
				toast({ message: data.message, type: "dark" });
				resetPrompt();
				setErrorWithFetchAction(null);
				fetchCredits();
			} catch (error) {
				setErrorWithFetchAction(error);
				cError("Error fetching members:", error);
				toast({ message: error, type: "danger" });
			} finally {
				setIsWaitingFetchAction(false);
			}
		}

		// handle rejecting a credit
		const restoreCreditRequest = async (id) => {
			try {
				setIsWaitingFetchAction(true);
				const response = await fetch(`${BASE_URL}/credit/${id}/restore`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ status: 'pending' }),
				});

				// Fetch error
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Error restoring credit request');
				}
				// Successfull fetch
				const data = await response.json();
				toast({ message: data.message, type: "dark" });
				resetConfirmDialog();
				setErrorWithFetchAction(null);
				fetchCredits();
			} catch (error) {
				setErrorWithFetchAction(error);
				cError("Error fetching members:", error);
				toast({ message: error, type: "danger" });
			} finally {
				setIsWaitingFetchAction(false);
			}
		}

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

				{loadingMembers && (<LoadingIndicator icon={<Users size={80} className="loading-skeleton" />} />)}
				{!loadingMembers && errorLoadingMembers && (
					<FetchError
						errorMessage={errorLoadingMembers}
						refreshFunction={() => fetchMembers()}
						className="mb-5 mt-4"
					/>
				)}
				{!loadingMembers && !errorLoadingMembers && membersToShow.length === 0 && (
					<NotFount
						notFoundMessage="No member found"
						icon={<Users size={80} className="text-center w-100 mb-3 opacity-50" />}
						refreshFunction={resetMembers}
					/>
				)}
				{!loadingMembers && !errorLoadingMembers && membersToShow.length > 0 && (
					<>
						<div className="mb-3">
							<div className="d-flex justify-content-lg-between gap-2 mt-3 overflow-auto">
								{membersToShow
									.sort((a, b) => a.husbandFirstName.localeCompare(b.husbandFirstName))
									.map((member, index) => (
										<div key={index} className='w-4rem ptr clickDown'
											title={`${member.husbandFirstName} ${member.husbandLastName}`}
											onClick={() => { setSelectedMember(member); setShowSelectedMemberCredits(true) }}
										>
											<img src={member.husbandAvatar}
												alt={`${member.husbandFirstName} ${member.husbandLastName}`}
												className="w-100 ratio-1-1 object-fit-cover p-1 bg-light rounded-circle"
											/>
											<div className="text-truncate fs-70 text-center mt-1">
												{`${member.husbandFirstName} ${member.husbandLastName}`}
											</div>
										</div>
									))}
							</div>
							<div className="d-flex d-lg-none">
								<DotsThreeOutline size={30} weight='fill' className='ms-auto me-2 text-gray-500' />
							</div>
						</div>

						{showSelectedMemberCredits &&
							<>
								<div className='position-fixed fixed-top inset-0 bg-black2 inx-high add-property-form'>
									<div className="container offset-md-3 col-md-9 offset-xl-2 col-xl-10 px-0 peak-borders-b overflow-auto" style={{ animation: "zoomInBack .2s 1", maxHeight: '100%' }}>
										<div className="container h-100 px-3 bg-light text-gray-700">
											<h6 className="sticky-top flex-align-center justify-content-between mb-4 pt-3 pb-2 bg-light text-gray-600 border-bottom">
												<div className='flex-align-center'>
													{/* <Blueprint weight='fill' className="me-1" /> */}
													<img src={selectedMember.husbandAvatar}
														alt={`${selectedMember.husbandFirstName.slice(0, 1)}.${selectedMember.husbandLastName}`}
														className="w-3rem ratio-1-1 object-fit-cover p-1 border border-3 border-secondary border-opacity-25 bg-light rounded-circle"
													/>
													<span className='ms-2' style={{ lineHeight: 1 }}>
														Credits of {`${selectedMember.husbandFirstName} ${selectedMember.husbandLastName}`}
													</span>
												</div>
												<div onClick={() => { setShowSelectedMemberCredits(false); }}>
													<X size={25} className='ptr' />
												</div>
											</h6>
											<div className="flex-align-center gap-3 mb-3">
												<div className='overflow-auto'>
													<table className="table table-hover h-100 properties-table">
														<thead className='table-warning position-sticky top-0 inx-1'>
															<tr>
																{/* <th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th> */}
																<th className='py-3 text-nowrap text-gray-700'>Title</th>
																<th className='py-3 text-nowrap text-gray-700'>Taken  <sub className='fs-60'>/RWF</sub></th>
																<th className='py-3 text-nowrap text-gray-700'>Paid  <sub className='fs-60'>/RWF</sub></th>
																<th className='py-3 text-nowrap text-gray-700'>Pending  <sub className='fs-60'>/RWF</sub></th>
																{/* <th className='py-3 text-nowrap text-gray-700'>Fines</th> */}
															</tr>
														</thead>
														<tbody>
															{allLoans
																.filter(loan => loan.memberId === selectedMember.id)
																.map((loan, index) => (
																	<>
																		<tr className={`small credit-row`}
																		>
																			<td className={`ps-sm-3  border-bottom-3 border-end fw-bold`}>
																				Loan
																			</td>
																			<td>
																				<CurrencyText amount={loan.loanTaken} />
																			</td>
																			<td className='text-primary-emphasis'>
																				<CurrencyText amount={loan.loanPaid} />
																			</td>
																			<td className='text-warning-emphasis'>
																				<CurrencyText amount={loan.loanPending} />
																			</td>
																		</tr>
																		<tr className={`small credit-row`}
																		>
																			<td className={`ps-sm-3  border-bottom-3 border-end fw-bold`}>
																				Interest
																			</td>
																			<td>
																				<CurrencyText amount={loan.loanTaken} />
																			</td>
																			<td>
																				<CurrencyText amount={loan.loanPaid} />
																			</td>
																			<td>
																				<CurrencyText amount={loan.loanPending} />
																			</td>
																		</tr>
																		<tr className={`small credit-row`}
																		>
																			<td className={`ps-sm-3  border-bottom-3 border-end fw-bold`}>
																				Tranches
																			</td>
																			<td>
																				<CurrencyText amount={loan.tranchesTaken} />
																			</td>
																			<td className='text-primary-emphasis'>
																				<CurrencyText amount={loan.tranchesPaid} />
																			</td>
																			<td className='text-warning-emphasis'>
																				<CurrencyText amount={loan.tranchesPending} />
																			</td>
																		</tr>
																	</>
																))
															}
														</tbody>
													</table>

													<div className="d-flex">
														<div className='col p-2'>
															<div className='flex-align-center text-muted border-bottom smaller'><Calendar className='me-1 opacity-50' /> <span className="text-nowrap">First loan</span></div>
															<div className='text-center bg-gray-300'><FormatedDate date="2022-12-01" /></div>
														</div>
														<div className='col p-2'>
															<div className='flex-align-center text-muted border-bottom smaller'><Calendar className='me-1 opacity-50' /> <span className="text-nowrap">Recent loan</span></div>
															<div className='text-center bg-gray-300'><FormatedDate date="2020-04-30" /></div>
														</div>
													</div>

												</div>
												{/* <div>
													Add savings for <b className='fw-semibold'>{selectedMember.husbandFirstName} {selectedMember.husbandLastName}</b>
												</div> */}
											</div>
											<hr />

											{/* The form */}
										</div>
									</div>
								</div>
							</>
						}

					</>
				)}

				<div className='text-gray-700 selective-options' style={{ backgroundColor: activeLoanSectionColor }}>
					{/* <h4 className='h6 mb-2 text-center fw-bold text-decoration-underline' style={{ textUnderlineOffset: '3px' }}>Loan requests</h4> */}
					{loadingCredits && (<LoadingIndicator text="Loading credits..." />)}
					{!loadingCredits && errorLoadingCredits && (
						<FetchError
							errorMessage={errorLoadingCredits}
							refreshFunction={() => fetchCredits()}
							className="mb-5 mt-4"
						/>
					)}
					{!loadingCredits && !errorLoadingCredits && creditsToShow.length === 0 && (
						<div className="col-sm-8 col-md-6 col-lg-5 col-xl-4 mx-auto my-5 p-3 rounded error-message">
							<img src="/images/fetch_error_image.jpg" alt="Error" className="w-4rem h-4rem mx-auto mb-2 opacity-50" />
							<p className="text-center text-muted small">
								No credits found.
							</p>
							<button className="btn btn-sm btn-outline-secondary d-block border-0 rounded-pill mx-auto px-4" onClick={fetchCredits}>
								<ArrowClockwise weight="bold" size={18} className="me-1" /> Refresh
							</button>
						</div>
					)}
					{!loadingCredits && !errorLoadingCredits && !loadingMembers && !errorLoadingMembers && creditsToShow.length > 0 && (
						<>
							{/* Selectors */}
							<div className="d-flex flex-wrap justify-content-center">
								<div className={`col d-flex flex-column flex-sm-row column-gap-2 p-2 border-top border-bottom border-2 border-warning border-opacity-25 tab-selector ${activeLoanSection === 'pending' ? 'active' : ''} user-select-none ptr clickDown`}
									style={{ '--_activeColor': '#f4e4b6' }}
									onClick={() => { setActiveLoanSection('pending'); setActiveLoanSectionColor('#f4e4b675') }}
								>
									<h5 className='mb-0 small'>Pending</h5>
									<p className='mb-0 fs-75'>( {creditsToShow.filter(cr => cr.status === 'pending').length} )</p>
								</div>
								<div className={`col d-flex flex-column flex-sm-row column-gap-2 p-2 border-top border-bottom border-2 border-success border-opacity-25 tab-selector ${activeLoanSection === 'approved' ? 'active' : ''} user-select-none ptr clickDown`}
									style={{ '--_activeColor': '#a3d5bb' }}
									onClick={() => { setActiveLoanSection('approved'); setActiveLoanSectionColor('#a3d5bb75') }}
								>
									<h5 className='mb-0 small'>Approved</h5>
									<p className='mb-0 fs-75'>( {creditsToShow.filter(cr => cr.status === 'approved').length} )</p>
								</div>
								<div className={`col d-flex flex-column flex-sm-row column-gap-2 p-2 border-top border-bottom border-2 border-danger border-opacity-25 tab-selector ${activeLoanSection === 'rejected' ? 'active' : ''} user-select-none ptr clickDown`}
									style={{ '--_activeColor': '#ebc1c5' }}
									onClick={() => { setActiveLoanSection('rejected'); setActiveLoanSectionColor('#ebc1c575') }}
								>
									<h5 className='mb-0 small'>Rejected</h5>
									<p className='mb-0 fs-75'>( {creditsToShow.filter(cr => cr.status === 'rejected').length} )</p>
								</div>
							</div>

							{/* Selected content */}
							<div style={{ minHeight: '60vh' }}>
								{activeLoanSection === 'pending' && (
									<>
										{creditsToShow.filter(cr => cr.status === 'pending').length > 0 && (
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
														{creditsToShow
															.filter(cr => cr.status === 'pending')
															.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
															.map((credit, index) => {
																const associatedMember = allMembers.find(m => m.id === credit.memberId);
																const memberNames = `${associatedMember.husbandFirstName} ${associatedMember.husbandLastName}`;
																const creditInterest = Number(credit.creditAmount) * (5 / 100);

																return (
																	<tr
																		key={index}
																		className={`small loan-row`}
																	>
																		<td className={`ps-sm-3  border-bottom-3 border-end`}>
																			{index + 1}
																		</td>
																		<td >
																			{memberNames}
																		</td>
																		<td className="d-flex flex-column gap-2 text-muted small" >
																			<div>
																				<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Loan</h6>
																				<span>{Number(credit.creditAmount).toLocaleString()}</span>
																			</div>
																			<div>
																				<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Interest</h6>
																				<span>{creditInterest.toLocaleString()}</span>
																			</div>
																			<div className='text-primaryColor'>{credit.tranches} tranche{credit.tranches > 1 ? 's' : ''}</div>
																		</td>
																		<td className='text-nowrap'>
																			<div className='d-flex flex-column gap-2 smaller'>
																				<span className='fw-bold'>
																					<FormatedDate date={credit.requestDate} monthFormat='numeric' /> <CaretRight /> <FormatedDate date={credit.dueDate} monthFormat='numeric' />
																				</span>
																				<span>{printDatesInterval(credit.requestDate, credit.dueDate)}</span>
																				<span className="flex-align-center text-primaryColor ptr clickDown"
																					onClick={() => { setSelectedCredit(credit); setShowBackfillPlanCard(true); }}
																				><Receipt weight='fill' size={18} className='me-1' /> View backfill plan</span>
																			</div>
																		</td>
																		<td style={{ maxWidth: '13rem' }}>
																			{credit.comment}
																		</td>
																		<td className='text-nowrap fs-75'>
																			<div className="dim-100 d-flex">
																				<button className='btn btn-sm text-primary-emphasis border-primary border-opacity-25 mb-auto rounded-0'
																					onClick={
																						() => { alert('Aprove credit') }
																					}
																				>
																					<Check /> Approve
																				</button>
																				<button className='btn btn-sm text-danger-emphasis border-danger border-opacity-25 mt-auto rounded-0'
																					onClick={
																						() => {
																							customPrompt(
																								{
																									message: (
																										<>
																											<h5 className='h6 border-bottom mb-3 pb-2'><ReceiptX size={25} weight='fill' className='opacity-50' /> Reject Credit Request</h5>
																											<p>
																												Provide a reason for rejecting this request and any helpful feedback.
																											</p>
																										</>
																									),
																									inputType: 'textarea',
																									action: () => rejectCreditRequest(credit.id),
																									placeholder: 'Rejection message',
																								}
																							)
																						}
																					}
																				>
																					<X /> Reject
																				</button>
																			</div>
																		</td>
																	</tr>
																)
															}
															)
														}
													</tbody>
												</table>
											</div>
										)}
										{/* Zero content - no credits */}
										{creditsToShow.filter(cr => cr.status === 'pending').length === 0 && (
											<NotFount
												notFoundMessage="No credit found"
												icon={<Receipt size={80} className="text-center w-100 mb-3 opacity-50" />}
												refreshFunction={fetchCredits}
											/>
										)}
									</>
								)}

								{activeLoanSection === 'approved' && (
									<>
										{creditsToShow.filter(cr => cr.status === 'approved').length > 0 && (
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
														{creditsToShow
															.filter(cr => cr.status === 'approved')
															.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
															.map((credit, index) => {
																const associatedMember = allMembers.find(m => m.id === credit.memberId);
																const memberNames = `${associatedMember.husbandFirstName} ${associatedMember.husbandLastName}`;
																const creditInterest = Number(credit.creditAmount) * (5 / 100);

																return (
																	<tr
																		key={index}
																		className={`small loan-row`}
																	>
																		<td className={`ps-sm-3  border-bottom-3 border-end`}>
																			{index + 1}
																		</td>
																		<td >
																			{memberNames}
																		</td>
																		<td className="d-flex flex-column gap-2 text-muted small" >
																			<div>
																				<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Loan</h6>
																				<span>{Number(credit.creditAmount).toLocaleString()}</span>
																			</div>
																			<div>
																				<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Interest</h6>
																				<span>{creditInterest.toLocaleString()}</span>
																			</div>
																			<div className='text-primaryColor'>{credit.tranches} tranche{credit.tranches > 1 ? 's' : ''}</div>
																		</td>
																		<td className='text-nowrap'>
																			<div className='d-flex flex-column gap-2 smaller'>
																				<span className='fw-bold'>
																					<FormatedDate date={credit.requestDate} monthFormat='numeric' /> <CaretRight /> <FormatedDate date={credit.dueDate} monthFormat='numeric' />
																				</span>
																				<span>{printDatesInterval(credit.requestDate, credit.dueDate)}</span>
																				<span className="flex-align-center text-primaryColor ptr clickDown"
																					onClick={() => { setSelectedCredit(credit); setShowBackfillPlanCard(true); }}
																				><Receipt weight='fill' size={18} className='me-1' /> View backfill plan</span>
																			</div>
																		</td>
																		<td style={{ maxWidth: '13rem' }}>
																			{credit.comment}
																		</td>
																		<td className='text-nowrap fs-75'>
																			Transfered
																		</td>
																	</tr>
																)
															}
															)
														}
													</tbody>
												</table>
											</div>
										)}
										{/* Zero content - no credits */}
										{creditsToShow.filter(cr => cr.status === 'approved').length === 0 && (
											<NotFount
												notFoundMessage="No credit found"
												icon={<Receipt size={80} className="text-center w-100 mb-3 opacity-50" />}
												refreshFunction={fetchCredits}
											/>
										)}
									</>

								)}

								{activeLoanSection === 'rejected' && (
									<>
										{creditsToShow.filter(cr => cr.status === 'rejected').length > 0 && (
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
														{creditsToShow
															.filter(cr => cr.status === 'rejected')
															.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
															.map((credit, index) => {
																const associatedMember = allMembers.find(m => m.id === credit.memberId);
																const memberNames = `${associatedMember.husbandFirstName} ${associatedMember.husbandLastName}`;
																const creditInterest = Number(credit.creditAmount) * (5 / 100);

																return (
																	<tr
																		key={index}
																		className={`small cursor-default clickDown loan-row`}
																	>
																		<td className={`ps-sm-3  border-bottom-3 border-end`}>
																			{index + 1}
																		</td>
																		<td >
																			{memberNames}
																		</td>
																		<td className="d-flex flex-column gap-2 text-muted small" >
																			<div>
																				<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Loan</h6>
																				<span>{Number(credit.creditAmount).toLocaleString()}</span>
																			</div>
																			<div>
																				<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Interest</h6>
																				<span>{creditInterest.toLocaleString()}</span>
																			</div>
																			<div className='text-primaryColor'>{credit.tranches} tranche{credit.tranches > 1 ? 's' : ''}</div>
																		</td>
																		<td className='text-nowrap'>
																			<div className='d-flex flex-column gap-2 smaller'>
																				<span className='fw-bold'>
																					<FormatedDate date={credit.requestDate} monthFormat='numeric' /> <CaretRight /> <FormatedDate date={credit.dueDate} monthFormat='numeric' />
																				</span>
																				<span>{printDatesInterval(credit.requestDate, credit.dueDate)}</span>
																				<span className="flex-align-center text-primaryColor ptr clickDown"
																					onClick={() => { setSelectedCredit(credit); setShowBackfillPlanCard(true); }}
																				><Receipt weight='fill' size={18} className='me-1' /> View backfill plan</span>
																			</div>
																		</td>
																		<td style={{ maxWidth: '13rem' }}>
																			{credit.comment}
																		</td>
																		<td style={{ maxWidth: '13rem' }}>
																			{credit.rejectionMessage}
																		</td>
																		<td className='text-nowrap fs-75'>
																			<button className='btn btn-sm btn-outline-secondary rounded-0'
																				onClick={
																					() => {
																						customConfirmDialog({
																							message: (
																								<>
																									<h5 className='h6 border-bottom mb-3 pb-2'><Receipt size={25} weight='fill' className='opacity-50' /> Restore Credit Request</h5>
																									<p>
																										This credit of <CurrencyText amount={Number(credit.creditAmount)} /> will be restored and marked pending.
																									</p>
																								</>
																							),
																							type: 'gray-700',
																							action: () => restoreCreditRequest(credit.id),
																							actionText: 'Restore',
																						});
																					}
																				}
																			>
																				<ArrowArcLeft /> Restore
																			</button>
																		</td>
																	</tr>
																)
															})
														}
													</tbody>
												</table>
											</div>
										)}
										{/* Zero content - no credits */}
										{creditsToShow.filter(cr => cr.status === 'rejected').length === 0 && (
											<NotFount
												notFoundMessage="No credit found"
												icon={<Receipt size={80} className="text-center w-100 mb-3 opacity-50" />}
												refreshFunction={fetchCredits}
											/>
										)}
									</>
								)}

								{showBackfillPlanCard && (
									<>
										<div className='position-fixed fixed-top inset-0 bg-black2 py-3 inx-high add-property-form'>
											<div className="container offset-md-3 col-md-9 offset-xl-2 col-xl-10 px-0 overflow-auto" style={{ animation: "zoomInBack .2s 1", maxHeight: '100%' }}>
												<div className="px-3 bg-light text-gray-700">
													<h6 className="sticky-top flex-align-center justify-content-between mb-4 pt-3 pb-2 bg-light text-gray-600 border-bottom text-uppercase">
														<div className='flex-align-center text-primaryColor'>
															<Receipt weight='fill' className="me-1" />
															<span style={{ lineHeight: 1 }}>Backfill plan</span>
														</div>
														<div onClick={() => { setShowBackfillPlanCard(false); }}>
															<X size={25} className='ptr' />
														</div>
													</h6>

													<div className="pb-5">
														<div className='alert bg-primaryColor text-gray-200 d-lg-flex align-items-end gap-3 border-0 rounded-0 shadow-sm'>
															<div className='fw-light'>
																{associatedMember[0] && (
																	<>
																		<div className='d-flex gap-2 mb-2'>
																			<img src={associatedMember[0].husbandAvatar}
																				alt={`${associatedMember[0].husbandFirstName.slice(0, 1)}.${associatedMember[0].husbandLastName}`}
																				className="w-3rem h-3rem flex-shrink-0 object-fit-cover p-1 border border-3 border-light border-opacity-25 rounded-circle"
																			/>
																			<div className='mt-1 fs-4 text-dark' style={{ lineHeight: 1 }}>
																				Backfill Plan of {
																					`${associatedMember[0].husbandFirstName} ${associatedMember[0].husbandLastName}`
																				}
																			</div>
																		</div>
																		<ul className='list-unstyled smaller'>
																			<li>
																				{/* Sort by most recent, filter with corresponding member's id and find index
																				 of the credit + 1 in the array which will be the nth credit requested*/}
																				<b className='fw-semibold me-1'>Credit N°:</b> {
																					creditsToShow
																						.sort((a, b) => new Date(a.requestDate) - new Date(b.requestDate))
																						.filter(cr => cr.memberId === associatedMember[0].id)
																						.findIndex(cr => cr.id === selectedCredit.id) + 1
																				}
																			</li>
																			<li>
																				<b className='fw-semibold me-1'>Comment:</b> {selectedCredit.comment}
																			</li>
																		</ul>
																	</>
																)}
															</div>
															<div className="d-flex flex-wrap ms-lg-auto">
																<div className='col px-2'>
																	<div className='flex-align-center smaller'><Calendar className='me-1 opacity-50' /> <span className="text-nowrap">Payment start date</span></div>
																	<div className='text-center bg-black3'><FormatedDate date={selectedCredit.requestDate} /></div>
																</div>
																<div className='col px-2'>
																	<div className='flex-align-center smaller'><Calendar className='me-1 opacity-50' /> <span className="text-nowrap">Payment end date</span></div>
																	<div className='text-center bg-black3'><FormatedDate date={selectedCredit.dueDate} /></div>
																</div>
															</div>
														</div>
														<ul className="list-unstyled d-flex flex-wrap gap-3 px-1 px-sm-2 px-lg-3 text-primaryColor small">
															<li className='border-start border-dark border-opacity-50 ps-2'>
																<b>Amount requested</b>: <CurrencyText amount={Number(selectedCredit.creditAmount)} />
															</li>
															<li className='border-start border-dark border-opacity-50 ps-2'>
																<b>Interest</b>: <CurrencyText amount={(Number(selectedCredit.creditAmount) * (5 / 100))} />
															</li>
															<li className='border-start border-dark border-opacity-50 ps-2'>
																<b>Amount to pay</b>: <CurrencyText amount={(Number(selectedCredit.creditAmount) + (Number(selectedCredit.creditAmount) * (5 / 100)))} />
															</li>
														</ul>

														{/* The plan */}
														<div className='overflow-auto'>
															<table className="table table-hover h-100 properties-table">
																<thead className='table-primary position-sticky top-0 inx-1'>
																	<tr>
																		<th className='ps-sm-3 py-3 text-nowrap text-gray-700 fw-normal'>Tranche</th>
																		<th className='py-3 text-nowrap text-gray-700 fw-normal'>Backfill amount</th>
																		<th className='py-3 text-nowrap text-gray-700 fw-normal'>Backfill date</th>
																		{!['pending', 'rejected'].includes(activeLoanSection) && (
																			<th className='py-3 text-nowrap text-gray-700 fw-normal'>Backfill slip</th>
																		)}
																	</tr>
																</thead>
																<tbody>
																	{JSON.parse(selectedCredit.creditPayment)
																		.sort((a, b) => a.tranchNumber - b.tranchNumber) // Sort tranches
																		.map((item, index) => {
																			const amountToPay = Number(selectedCredit.creditAmount) + (Number(selectedCredit.creditAmount) * (5 / 100));
																			const backFillAmount = amountToPay / selectedCredit.tranches;
																			return (
																				<tr
																					key={index}
																					className="small expense-row"
																				>
																					<td className="ps-sm-3 border-bottom-3 border-end">
																						{item.tranchNumber}
																					</td>
																					<td>
																						<CurrencyText amount={backFillAmount} />
																					</td>
																					<td>
																						<FormatedDate date={item.tranchDueDate} />
																					</td>
																					{!['pending', 'rejected'].includes(activeLoanSection) && (
																						<td className="text-nowrap">
																							{item.slipUrl ? (
																								<img src={item.slipUrl} alt="Payment Slip" className='w-2rem h-2rem object-fit-contain img-thumbnail ptr clickDown' />
																							) : (
																								<button type="button" className='btn btn-sm text-primaryColor border-0 rounded-0 clickDown' onClick={() => alert('Upload a file')}
																								>
																									Upload slip <Upload />
																								</button>
																							)}
																						</td>
																					)}
																				</tr>
																			)
																		})
																	}
																</tbody>
															</table>
														</div>

														{activeLoanSection === 'pending' && (
															<div className='d-flex flex-wrap align-items-center justify-content-end gap-3 mb-4 py-4'>
																<button className='btn btn-sm flex-align-center text-danger-emphasis border-danger border-opacity-25 mt-auto rounded-0'
																	onClick={
																		() => {
																			customPrompt(
																				{
																					message: (
																						<>
																							<h5 className='h6 border-bottom mb-3 pb-2'><ReceiptX size={25} weight='fill' className='opacity-50' /> Reject Credit Request</h5>
																							<p>
																								Provide a reason for rejecting this request and any helpful feedback.
																							</p>
																						</>
																					),
																					inputType: 'textarea',
																					action: () => rejectCreditRequest(selectedCredit.id),
																					placeholder: 'Rejection message',
																				}
																			)
																		}
																	}
																>
																	<X /> Reject credit</button>
																<button className='btn btn-sm flex-align-center text-primary-emphasis border-primary border-opacity-25 mb-auto rounded-0'
																	onClick={() => { alert('Aprove credit') }}
																>
																	<Check /> Approve credit
																</button>
															</div>
														)}
													</div>
												</div>
											</div>
										</div>
									</>
								)}
							</div>
						</>
					)}
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
					<div style={{ minHeight: '60vh' }}>
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
												.sort((a, b) => new Date(b.date) - new Date(a.date))
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
												<div className="h-100 px-3 bg-light text-gray-700">
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
															{!isWaitingFetchAction ?
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

						{/* <>
							{creditsToShow.filter(r => r.recordType === 'deposit').length > 0 && (

							)}
							</> */}
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
										{recordsToShow
											.filter(cr => cr.recordType === 'deposit')
											.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
											.map((record, index) => {
												const associatedMember = allMembers.find(m => m.id === record.memberId);
												const memberNames = `${associatedMember.husbandFirstName} ${associatedMember.husbandLastName}`;

												return (
													<tr
														key={index}
														className="small cursor-default clickDown expense-row"
													>
														<td className="ps-sm-3 border-bottom-3 border-end">
															{index + 1}
														</td>
														<td className="text-nowrap">
															{/* {record.member} */}
															{memberNames}
														</td>
														<td>
															{record.recordType[0].toUpperCase() + record.recordType.slice(1)}
														</td>
														<td>
															<CurrencyText amount={Number(record.recordAmount)} />
														</td>
														<td className="text-nowrap">
															{record.comment}
														</td>
														<td style={{ maxWidth: '13rem' }}>
															{new Intl.DateTimeFormat('en-gb', {
																day: '2-digit',
																month: '2-digit',
																year: 'numeric',
															}).format(new Date(record.createdAt))} {/* Formats the date */}
														</td>
													</tr>
												)
											}
											)
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
						<div style={{ minHeight: '60vh' }}>
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
																Credit: <CurrencyText amount={item.credit} boldAmount smallCurrency className='text-gray-700' />
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
				{/* <DateLocaleFormat /> */}
				<JsonJsFormatter />
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

			{/* Prompt actions */}
			<ActionPrompt
				show={showPrompt}
				// isStatic
				message={promptMessage}
				type={promptType}
				inputType={promptInputType}
				selectInputOptions={promptSelectInputOptions}
				promptInputValue={promptInputValue}
				inputPlaceholder={promptInputPlaceholder}
				action={() => { promptAction(); setPromptActionWaiting(true); }}
				actionIsWaiting={promptActionWaiting}
				onClose={resetPrompt}
			/>

			{/* Dialog actions */}
			<ConfirmDialog
				show={showConfirmDialog}
				message={confirmDialogMessage}
				type={confirmDialogType}
				action={() => { confirmDialogAction(); setConfirmDialogActionWaiting(true); }}
				actionText={confirmDialogActionText}
				actionIsWaiting={confirmDialogActionWaiting}
				closeText={confirmDialogCloseText}
				onClose={resetConfirmDialog}
				onCloseCallback={confirmDialogCloseCallback}
			/>

			{/* Ongoing/unsettled fetch indicator */}
			{isWaitingFetchAction && (
				<div className='position-fixed fixed-top inset-0 bg-black3 flex-center py-md-3 px-lg-5 inx-high'>
					<LoadingIndicator loaderColor="gray-200" />
				</div>
			)}

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

								{/* <li className={`nav-item mb-2 ${activeSection === 'auditLogs' ? 'active' : ''}`}
									onClick={() => { setActiveSection("auditLogs"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<Notebook size={20} weight='fill' className="me-2" /> Audit Logs
									</button>
								</li> */}

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
