import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Button, Form } from "react-bootstrap";
import './admin.css';
import MyToast from '../../common/Toast';
import { ArrowArcLeft, ArrowClockwise, ArrowSquareOut, BellSimple, Blueprint, Calendar, CaretDown, CaretRight, CashRegister, ChartBar, ChartPie, ChartPieSlice, ChatTeardropText, Check, CheckCircle, Coin, Coins, CurrencyDollarSimple, DotsThreeOutline, DotsThreeVertical, EscalatorUp, Eye, Files, FloppyDisk, Gavel, Gear, GenderFemale, GenderMale, GreaterThan, HandCoins, Info, LessThan, List, Minus, Notebook, Pen, Plus, Receipt, ReceiptX, SignOut, User, UserCirclePlus, UserFocus, UserMinus, Users, Warning, WarningCircle, X } from '@phosphor-icons/react';
import { expensesTypes, generalReport, incomeExpenses, memberRoles } from '../../../data/data';
import ExportDomAsFile from '../../common/exportDomAsFile/ExportDomAsFile';
import DateLocaleFormat from '../../common/dateLocaleFormats/DateLocaleFormat';
import CurrencyText from '../../common/CurrencyText';
import LoadingIndicator from '../../LoadingIndicator';
import { cError, cLog, fncPlaceholder, formatDate, normalizedLowercaseString, printDatesInterval } from '../../../scripts/myScripts';
import FormatedDate from '../../common/FormatedDate';
import FetchError from '../../common/FetchError';
import useCustomDialogs from '../../common/hooks/useCustomDialogs';
import ActionPrompt from '../../common/actionPrompt/ActionPrompt';
import ConfirmDialog from '../../common/confirmDialog/ConfirmDialog';
import NotFound from '../../common/NotFound';
import JsonJsFormatter from '../../common/JsonJsFormatter';
import EmptyBox from '../../common/EmptyBox';
import AbsoluteCloseButton from '../../common/AbsoluteCloseButton';
import LineGraph from '../../chartJS/LineGraph';
import BarGraph from '../../chartJS/BarGraph';
import PieGraph from '../../chartJS/PieGraph';
import CountUp from 'react-countup'
import SystemSettings from '../../systemSettings/SystemSettings';

import { Menu, MenuItem, MenuButton, MenuDivider } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/zoom.css';
import ContentToggler from '../../common/ContentToggler';
import DividerText from '../../common/DividerText';
import { BASE_URL, Axios } from '../../../api/api';

const Admin = () => {

	// Custom hooks
	const {
		// Toast
		showToast,
		toastMessage,
		toastType,
		toastSelfClose,
		toast,
		successToast,
		warningToast,
		messageToast,
		resetToast,

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
			sideNavbarRef.current.classList.add('flyOutT');
			setTimeout(() => {
				setSideNavbarIsFloated(false); // Close navbar
				sideNavbarRef.current.classList.remove('flyOutT');
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

	/**
	 * Members
	 */

	const [allMembers, setAllMembers] = useState([]);
	const [membersToShow, setMembersToShow] = useState([]);
	const [loadingMembers, setLoadingMembers] = useState(false);
	const [errorLoadingMembers, setErrorLoadingMembers] = useState(false);

	const totalCotisation = allMembers.reduce((sum, m) => (sum + (m.shares * 20000)), 0);
	const totalSocial = allMembers.reduce((sum, m) => sum + m.social, 0);

	const accountantNames = useMemo(() => {
		const member = allMembers.find(m => (m.role === 'accountant'));
		return `${member?.husbandLastName} ${member?.husbandFirstName}`;
	}, [allMembers]);

	const accountantAvatar = useMemo(() => {
		const member = allMembers.find(m => (m.role === 'accountant'));
		return member?.husbandAvatar;
	}, [allMembers]);

	// Fetch members
	const fetchMembers = async () => {
		try {
			setLoadingMembers(true);
			const response = await Axios.get(`/users`);
			const data = response.data;
			setAllMembers(data);
			setMembersToShow(data);
			setErrorLoadingMembers(null);
		} catch (error) {
			setErrorLoadingMembers("Failed to load members. Click the button to try again.");
			warningToast({ message: errorLoadingMembers, type: "danger" });
			console.error("Error fetching members:", error);
		} finally {
			setLoadingMembers(false);
		}
	};

	useEffect(() => {
		fetchMembers();
	}, []);

	const activeMembers = useMemo(() => (
		allMembers.filter(m => (m.status !== 'removed' && m.status !== 'inactive'))
	), [allMembers]);

	const activeAndInactiveMembers = useMemo(() => (
		allMembers.filter(m => m.status !== 'removed')
	), [allMembers]);

	const totalMembers = useMemo(() => {
		return allMembers.length;
	}, [allMembers]);

	const totalActiveMembers = useMemo(() => {
		return activeMembers.length;
	}, [activeMembers]);


	// Members statistics
	const [menCount, setMenCount] = useState(0);
	const [womenCount, setWomenCount] = useState(0);

	const membersChartData = useMemo(() => {
		if (totalMembers > 0) {
			setMenCount(allMembers.filter(member => member.husbandFirstName !== null).length);
			setWomenCount(allMembers.filter(member => ![null, 'N', 'N/A', 'NA'].includes(member.wifeFirstName)).length);

			return {
				labels: ['Men', 'Women'],
				datasets: [
					{
						label: 'Total Number',
						data: [menCount, womenCount],
						borderColor: ['rgba(106, 142, 35, 1)', 'rgba(219, 29, 213, 1)'],
						backgroundColor: ['rgba(106, 142, 35, 0.5)', 'rgba(219, 29, 213, 0.5)'],
						borderWidth: 1,
					},
				],
				hoverOffset: 5,
			};
		}
	}, [allMembers, totalMembers, menCount, womenCount]);

	/**
	 * Figures
	 */

	const [allFigures, setAllFigures] = useState({});
	const [loadingFigures, setLoadingFigures] = useState(false);
	const [errorLoadingFigures, setErrorLoadingFigures] = useState(false);

	// Fetch figures
	const fetchFigures = async () => {
		try {
			setLoadingFigures(true);
			const response = await Axios.get(`/figures`);
			const data = response.data;
			setAllFigures(data);
			setErrorLoadingFigures(null);
		} catch (error) {
			setErrorLoadingFigures("Failed to load figures. Click the button to try again.");
			warningToast({ message: errorLoadingFigures });
			console.error("Error fetching figures:", error);
		} finally {
			setLoadingFigures(false);
		}
	};

	useEffect(() => {
		fetchFigures();
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
			const response = await Axios.get(`/credits`);
			const data = response.data;
			setAllCredits(data);
			setCreditsToShow(data);
			setErrorLoadingCredits(null);
		} catch (error) {
			setErrorLoadingCredits("Failed to load credits. Click the button to try again.");
			warningToast({ message: errorLoadingCredits });
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
			const response = await Axios.get(`/loans`);
			const data = response.data;
			setAllLoans(data);
			setLoansToShow(data);
			setErrorLoadingLoans(null);
		} catch (error) {
			setErrorLoadingLoans("Failed to load loans. Click the button to try again.");
			warningToast({ message: errorLoadingLoans });
			console.error("Error fetching loans:", error);
		} finally {
			setLoadingLoans(false);
		}
	};

	useEffect(() => {
		fetchLoans();
	}, []);

	const interestToReceive = allLoans.reduce((sum, m) => sum + m.interestPaid, 0);
	const pendingInterest = useMemo(() => (
		allLoans.reduce((sum, m) => sum + m.interestPending, 0)
	), [allLoans]);

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
			const response = await Axios.get(`/records`);
			const data = response.data;
			setAllRecords(data);
			setRecordsToShow(data);
			setErrorLoadingRecords(null);
		} catch (error) {
			setErrorLoadingRecords("Failed to load records. Click the button to try again.");
			warningToast({ message: errorLoadingRecords });
			console.error("Error fetching records:", error);
		} finally {
			setLoadingRecords(false);
		}
	};

	useEffect(() => {
		fetchRecords();
	}, []);

	const totalExpenses = useMemo(() => (
		allRecords
			.filter(r => r.recordType === 'expense')
			.reduce((sum, r) => sum + Number(r.recordAmount), 0)
	), [allRecords]);

	const [activeSection, setActiveSection] = useState("dashboard");
	// const [activeSection, setActiveSection] = useState("messages");
	// const [activeSection, setActiveSection] = useState("members");
	// const [activeSection, setActiveSection] = useState("savings");
	// const [activeSection, setActiveSection] = useState("credits");
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

		const totalLoanDisbursed = allFigures?.loanDisbursed
		const totalPaidCapital = allFigures?.paidCapital
		const totalPenalties = allFigures?.penalties
		const totalBalance = allFigures?.balance

		const dashboardDT = [
			{ label: 'Cotisation', value: totalCotisation, },
			{ label: 'Social', value: totalSocial, },
			{ label: 'Loan Delivered', value: totalLoanDisbursed, },
			{ label: 'Paid Interest', value: interestToReceive, },
			{ label: 'Pending Interest', value: pendingInterest, },
			{ label: 'Paid Capital', value: totalPaidCapital, },
			{ label: 'Penalties', value: totalPenalties, },
			{ label: 'Expenses', value: totalExpenses, },
			{ label: 'Balance', value: totalBalance, },
		]

		return (
			<>

				<div ref={accountingDashboardRef} className="container py-4 bg-bodi">
					<h2 className="mb-3 text-center text-uppercase text-primaryColor">Accounting Dashboard</h2>
					<div className='flex-align-center mb-3'>
						<hr className='flex-grow-1 my-0' />
						<CurrencyDollarSimple size={45} className='mx-2 p-2 text-gray-500 border border-2 border-secondary border-opacity-25 rounded-circle' />
						<hr className='flex-grow-1 my-0' />
					</div>
					{/* <div className="d-lg-flex align-items-center">
						<img src="/images/dashboard_visual.png" alt="" className='col-md-5' />
						<div className='alert mb-4 rounded-0 smaller fw-light'>
							This numerical report provides a financial status overview for IKIMINA INGOBOKA saving management system. It highlights key metrics, including contributions, social funds, loans disbursed, interest receivables, paid capital, and other financial indicators. The report reflects the financial management system's performance, tracking transactions from stakeholder contributions, savings, investments, and other financial activities, all aligned with the system's saving balance and agreements established among its members.
						</div>
					</div> */}
					{loadingFigures && (
						<div className="row gx-3 gy-4 gy-lg-3 pb-3 rounded-4 loading-skeleton">
							{Array.from({ length: 9 }).map((_, index) => (
								<div className="col-md-6 col-lg-4" key={index}>
									<div className="card bg-gray-400 py-3 border-0 rounded-0 h-100">
										<div className="card-body">
											<div className="h6 mb-4 p-3 fs-5 bg-gray-200"></div>
											<p className="p-2 bg-gray-200"></p>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
					{!loadingFigures && errorLoadingFigures && (
						<FetchError
							errorMessage={errorLoadingFigures}
							refreshFunction={() => fetchFigures()}
							className="mb-5 mt-4"
						/>
					)}
					{!loadingFigures && !errorLoadingFigures && (
						<div className="row gx-3 gy-4 gy-lg-3 pb-3 rounded-4">
							{dashboardDT.map((item, index) => (
								<div className="col-md-6 col-lg-4" key={index}>
									<div className="card py-3 border-0 rounded-0 h-100 border-end border-4 border-primaryColor">
										<div className="card-body">
											<h6 className="card-title mb-4 fs-5 text-uppercase fw-bold text-gray-700">
												{item.label}
											</h6>
											<p className="card-text text-primaryColor">
												<CurrencyText amount={Number(item.value)} />
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
					<hr />
					<div>
						<p className='text'>
							Done on <FormatedDate date={new Date()} locale='en-CA' monthFormat='long' hour12Format={true} className="fw-semibold" /> by IKIMINA INGOBOKA Accountant, {accountantNames}.
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
		const [membersToShow, setMembersToShow] = useState(activeMembers);
		const [memberSearchValue, setMemberSearchValue] = useState('');
		const [showMemberStats, setShowMemberStats] = useState(false);

		// Search members
		const memberSearcherRef = useRef();

		const filterMembersBySearch = useCallback(() => {
			const searchString = normalizedLowercaseString(memberSearchValue).trim();

			if (searchString) {
				const filteredMembers = activeMembers.filter((val) => {
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
						(val.wifeLastName &&
							normalizedLowercaseString(val.wifeLastName)
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
		}, [memberSearchValue]);

		const resetMembers = () => {
			setMembersToShow(activeMembers);
		}

		// Reset members
		useEffect(() => {
			if (memberSearchValue === '') {
				resetMembers();
			}
		}, [memberSearchValue]);

		// Registration
		const [showAddMemberForm, setShowAddMemberForm] = useState(false);

		const [formData, setFormData] = useState({
			role: '',
			username: '',
			husbandFirstName: '',
			husbandLastName: '',
			husbandPhone: '',
			husbandEmail: '',
			wifeFirstName: '',
			wifeLastName: '',
			wifePhone: '',
			wifeEmail: '',
		});

		const resetRegistrationForm = () => {
			setFormData({
				role: '',
				username: '',
				husbandFirstName: '',
				husbandLastName: '',
				husbandPhone: '',
				husbandEmail: '',
				wifeFirstName: '',
				wifeLastName: '',
				wifePhone: '',
				wifeEmail: '',
			});
			setAutoGeneratePassword(true);
		};

		const [showWifeDetails, setShowWifeDetails] = useState(false);
		const [autoGeneratePassword, setAutoGeneratePassword] = useState(false);
		const [registrationPassword, setRegistrationPassword] = useState('');

		const handleChange = (e) => {
			const { name, value } = e.target;
			setFormData((prevData) => ({
				...prevData,
				[name]: value,
			}));
		};

		useEffect(() => {
			if (autoGeneratePassword) {
				setRegistrationPassword('');
			}
		}, [autoGeneratePassword]);

		// Validate registration
		const [emailTaken, setEmailTaken] = useState(false);
		const [usernameTaken, setUsernameTaken] = useState(false);
		const [phoneNumberTaken, setPhoneNumberTaken] = useState(false);
		const [canRegisterNewMember, setCanRegisterNewMember] = useState(false);

		// Check for unique data
		useEffect(() => {
			const emailExists = allMembers.some(m =>
				m.husbandEmail === formData.husbandEmail ||
				m.husbandEmail === formData.wifeEmail ||
				m.wifeEmail === formData.wifeEmail ||
				m.wifeEmail === formData.husbandEmail
			);

			const usernameExists = allMembers.some(m =>
				normalizedLowercaseString(m.username) === normalizedLowercaseString(formData.username)
			);

			const phoneNumberExists = allMembers.some(m =>
				m.husbandPhone === formData.husbandPhone ||
				m.husbandPhone === formData.wifePhone ||
				m.wifePhone === formData.wifePhone ||
				m.wifePhone === formData.husbandPhone
			);

			// Only update states if values change (prevents redundant re-renders)
			setEmailTaken(prev => (prev !== emailExists ? emailExists : prev));
			setUsernameTaken(prev => (prev !== usernameExists ? usernameExists : prev));
			setPhoneNumberTaken(prev => (prev !== phoneNumberExists ? phoneNumberExists : prev));
		}, [formData, allMembers]);

		// Allow or block registration
		useEffect(() => {
			setCanRegisterNewMember(!(emailTaken || usernameTaken || phoneNumberTaken));
		}, [emailTaken, usernameTaken, phoneNumberTaken]);

		// Handle registration
		const handleRegisterNewMember = async (e) => {
			if (e) e.preventDefault();

			const payload = {
				...formData,
				password: registrationPassword,
				autoGeneratePassword,
			};

			try {
				setIsWaitingFetchAction(true);
				const response = await Axios.post(`/users/register`, payload);
				// Successfull fetch
				const data = response.data;
				successToast({ message: `Success: ${data.message}` });
				resetRegistrationForm();
				setErrorWithFetchAction(null);
				fetchMembers();
				fetchLoans();
			} catch (error) {
				setErrorWithFetchAction(error);
				cError('Registration error:', error.response?.data || error.message);
				warningToast({ message: error.response?.data.message || 'Registration failed' });
			} finally {
				setIsWaitingFetchAction(false);
			}
		};

		// Edit member data
		const [showEditMemberForm, setShowEditMemberForm] = useState(false);
		const [selectedMember, setSelectedMember] = useState(activeMembers[0]);
		const [editHeadOfFamily, setEditHeadOfFamily] = useState(true);

		const [editSelectedmemberRole, setEditSelectedmemberRole] = useState('');
		const [editSelectedmemberUsername, setEditSelectedmemberUsername] = useState('');
		const [editSelectedmemberFName, setEditSelectedmemberFName] = useState('');
		const [editSelectedmemberLName, setEditSelectedmemberLName] = useState('');
		const [editSelectedmemberPhone, setEditSelectedmemberPhone] = useState('');
		const [editSelectedmemberEmail, setEditSelectedmemberEmail] = useState('');

		// Togger member editor
		useEffect(() => {
			if (showEditMemberForm && selectedMember) {
				setEditSelectedmemberRole(selectedMember?.role);
			} else {
				setEditSelectedmemberRole(selectedMember?.role || '');
			}
		}, [showEditMemberForm, selectedMember]);

		useEffect(() => {
			if (selectedMember) {
				setEditSelectedmemberUsername(selectedMember?.username);
				if (editHeadOfFamily) {
					setEditSelectedmemberFName(selectedMember?.husbandFirstName);
					setEditSelectedmemberLName(selectedMember?.husbandLastName);
					setEditSelectedmemberPhone(selectedMember?.husbandPhone);
					setEditSelectedmemberEmail(selectedMember?.husbandEmail);
				} else {
					setEditSelectedmemberFName(selectedMember?.wifeFirstName || '');
					setEditSelectedmemberLName(selectedMember?.wifeLastName || '');
					setEditSelectedmemberPhone(selectedMember?.wifePhone || '');
					setEditSelectedmemberEmail(selectedMember?.wifeEmail || '');
				}
			}
		}, [selectedMember, editHeadOfFamily, showEditMemberForm]);

		const [showAddImageForm, setShowAddImageForm] = useState(false);
		const [imageFile, setImageFile] = useState(null);
		const [imageFileName, setImageFileName] = useState(null);

		const handleImageFileChange = (e) => {
			const file = e.target.files[0];
			if (file && !file.type.startsWith("image/")) {
				toast({
					message: "Please upload valid image file.",
					type: "danger",
				});
				return;
			}
			setImageFile(file);
			setImageFileName(file?.name || ""); // Set the file name
		};

		// Handle edit member photo/avatar
		// const handleEditMemberAvatar = async (id, type) => {
		// 	try {
		// 		setIsWaitingFetchAction(true);
		// 		const response = await Axios.post(`/user/${id}/edit-${type}-info`, payload);
		// 		// Successfull fetch
		// 		const data = response.data;
		// 		successToast({ message: data.message });
		// 		resetRegistrationForm();
		// 		setErrorWithFetchAction(null);
		// 		fetchLoans();
		// 		fetchMembers();
		// 	} catch (error) {
		// 		setErrorWithFetchAction(error);
		// 		cError('Registration error:', error.response?.data || error.message);
		// 		warningToast({ message: `Error: ${error.response?.data.message || 'Registration failed'}` });
		// 	} finally {
		// 		setIsWaitingFetchAction(false);
		// 	}
		// };

		// Handle edit member info
		const handleEditMemberInfo = async (id, type) => {

			const memberInfo = type === 'husband' ? {
				role: editSelectedmemberRole,
				username: editSelectedmemberUsername,
				husbandFirstName: editSelectedmemberFName,
				husbandLastName: editSelectedmemberLName,
				husbandPhone: editSelectedmemberPhone,
				husbandEmail: editSelectedmemberEmail
			} : type === 'wife' ? {
				role: editSelectedmemberRole,
				username: editSelectedmemberUsername,
				wifeFirstName: editSelectedmemberFName,
				wifeLastName: editSelectedmemberLName,
				wifePhone: editSelectedmemberPhone,
				wifeEmail: editSelectedmemberEmail
			} : null;

			if (memberInfo === null) {
				return warningToast({ message: 'Please select a member to edit and continue', type: 'gray-700' })
			}

			// Prevent empty string value
			if (Object.values(memberInfo).some(value => value === '')) {
				return warningToast({ message: 'Please fill out all information to continue', type: 'gray-700' })
			}

			try {
				setIsWaitingFetchAction(true);
				const response = await Axios.post(`/user/${id}/edit-${type}-info`, memberInfo);
				// Successfull fetch
				const data = response.data;
				successToast({ message: data.message });
				setShowEditMemberForm(false);
				setErrorWithFetchAction(null);
				fetchMembers();
			} catch (error) {
				setErrorWithFetchAction(error);
				cError('Error saving changes:', error.response?.data || error.message);
				warningToast({ message: error.response?.data.message || 'Couldn\'t save changes. Tyr again' })
			} finally {
				setIsWaitingFetchAction(false);
			}
		};

		// Member financial overview and member removal 
		const [showMemberFinances, setShowMemberFinances] = useState(false);
		const [showMemberRemoval, setShowMemberRemoval] = useState(false);
		const hideMemberFinances = () => {
			setShowMemberFinances(false);
			setShowMemberRemoval(false);
		}

		const [canRemoveMember, setCanRemoveMember] = useState(false);

		const handleRemoveMember = async (email) => {
			try {
				setIsWaitingFetchAction(true);
				const response = await Axios.post(`/user/remove`, { email });

				// Successfull fetch
				const data = response.data;
				successToast({ message: data.message, selfClose: false });
				hideMemberFinances();
				resetConfirmDialog();
				setErrorWithFetchAction(null);
				fetchMembers();
				fetchLoans();
			} catch (error) {
				setErrorWithFetchAction(error);
				cError('Error removing member:', error.response?.data || error.message);
				warningToast({ message: error.response?.data.message || 'Couldn\'t remove this member' });
			} finally {
				setIsWaitingFetchAction(false);
			}
		};

		return (
			<div className="pt-2 pt-md-0 pb-3">
				<div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
					<h2 className='text-appColor'><Users weight='fill' className="me-1 opacity-50" /> Members</h2>
					<div className="ms-auto d-flex gap-1">
						<button className='btn btn-sm flex-center gap-1 text-primaryColor fw-semibold border-secondary border border-opacity-25 clickDown'
							onClick={() => setShowMemberStats(!showMemberStats)}>
							<ChartBar /> <span className='d-none d-sm-inline'> Statistics</span>
						</button>
						<button className='btn btn-sm flex-center gap-1 text-primaryColor fw-semibold border-secondary border border-opacity-25 clickDown'
							onClick={() => setShowAddMemberForm(true)}>
							<Plus /> New member
						</button>
					</div>
				</div>

				{showMemberStats && (
					<div className={`collapsible-grid-y ${showMemberStats ? 'working' : ''}`} style={{ animation: "zoomInBack .5s 1", }}>
						<div className="row mb-3 collapsing-content statistics-wrapper">
							<div className="col-12 col-lg-6">
								<BarGraph data={membersChartData} title='Members statistics' />
							</div>
							<div className="col-12 col-lg-6 alert mb-4 rounded-0 smaller fw-light">
								<p>
									Simple statistics of the members registered in Ikimina Ingoboka system
								</p>
								<div className="d-flex align-items-end gap-4 text-gray-600">
									<div className="position-relative flex-shrink-0 flex-center h-7rem px-3 fw-bold border border-3 border-secondary border-opacity-25 text-primaryColor rounded-pill" style={{ minWidth: '7rem' }}>
										<span className="display-1 fw-bold"><CountUp end={totalActiveMembers} /> </span> <small className='position-absolute start-50 bottom-0 border border-2 px-2 rounded-pill bg-light'>accounts</small>
									</div>
									<ul className="list-unstyled d-flex flex-wrap row-gap-1 column-gap-3 fs-6">
										<li className='border-start border-dark border-opacity-50 ps-2'>
											<b>Total men</b>: <CountUp end={menCount} />
										</li>
										<li className='border-start border-dark border-opacity-50 ps-2'>
											<b>Total women</b>: <CountUp end={womenCount} />
										</li>
										<li className='border-start border-dark border-opacity-50 ps-2'>
											<b>Total members</b>: <CountUp end={menCount + womenCount} />
										</li>
									</ul>
								</div>
							</div>
						</div>
						<CaretDown size={45} className='p-2 fw-light d-block mx-auto mb-5 text-primaryColor' style={{ animation: "flyInTop 2s 1" }} />
					</div>
				)}

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
						<NotFound
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
											<img src={member.husbandAvatar ? member.husbandAvatar : '/images/man_avatar_image.jpg'} alt=""
												className="w-5rem ratio-1-1 object-fit-cover p-1 border border-3 border-secondary border-opacity-25 bg-light rounded-circle"
											/>
											<img src={member.wifeAvatar ? member.wifeAvatar : '/images/woman_avatar_image.jpg'}
												alt={member.wifeFirstName ? `${member.wifeFirstName.slice(0, 1)}.${member.wifeLastName}` : 'Partner image'}
												className="w-5rem ratio-1-1 object-fit-cover p-1 border border-3 border-secondary border-opacity-25 bg-light rounded-circle"
											/>
										</div>

										<div className="position-absolute top-0 start-0 ms-3 translate-middle-y flex-align-center gap-2">
											<Menu menuButton={
												<MenuButton className="btn btn-sm bg-gray-300 text-700 flex-align-center">
													<CaretDown className="me-1" /> More
												</MenuButton>
											} transition>
												<MenuItem onClick={() => { setSelectedMember(member); setShowMemberFinances(true); }}>
													<Coins weight='fill' className="me-2 opacity-50" /> Finances
												</MenuItem>
												<MenuItem onClick={() => { setSelectedMember(member); setShowEditMemberForm(true); }}>
													<Pen weight='fill' className="me-2 opacity-50" /> Edit
												</MenuItem>
												<MenuDivider />
												<MenuItem onClick={() => { setSelectedMember(member); setShowMemberFinances(true); setShowMemberRemoval(true); }} className='text-danger'>
													<UserMinus weight='fill' className="me-2 opacity-50" />Leaving
												</MenuItem>
											</Menu>
										</div>

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
															<b>Phone:</b> <a href={`tel:+${member.husbandPhone}`} className='text-decoration-none text-inherit' title={`Call ${member.husbandFirstName}`}>{member.husbandPhone}</a>
														</li>
														<li className="py-1">
															<b>Email:</b> <a href={`mailto:${member.husbandEmail}`} className='text-decoration-none text-inherit' title={`Send email to ${member.husbandFirstName}`}>{member.husbandEmail}</a>
														</li>
													</ul>
												</div>
												<div className="col-lg-6 px-lg-2">
													<h6 className="flex-align-center px-2 py-1 border-bottom border-2 text-primaryColor fw-bolder">
														<User className="me-1" /> Wife
													</h6>
													<ul className="list-unstyled text-gray-700 px-2 smaller">
														<li className="py-1">
															<b>Names:</b> {member.wifeFirstName ? `${member.wifeFirstName} ${member.wifeLastName}` : 'Not provided'}
														</li>
														<li className="py-1">
															<b>Phone:</b> {member.wifePhone ? (
																<a href={`tel:+${member.wifePhone}`} className='text-decoration-none text-inherit' title={`Call ${member.wifeFirstName}`}>{member.wifePhone}</a>
															) : 'Not provided'}
														</li>
														<li className="py-1">
															<b>Email:</b>  {member.wifeEmail ? (
																<a href={`mailto:${member.wifeEmail}`} className='text-decoration-none text-inherit' title={`Send email to ${member.wifeFirstName}`}>{member.wifeEmail}</a>

															) : 'Not provided'}
														</li>
													</ul>
												</div>
											</div>
										</div>
									</div>
								))
							}

							{/* Registration */}
							{showAddMemberForm &&
								<>
									<div className='position-fixed fixed-top inset-0 bg-black2 py-3 py-md-5 inx-high add-property-form'>
										<div className="container col-md-6 col-lg-5 col-xl-4 overflow-auto" style={{ animation: "zoomInBack .2s 1", maxHeight: '100%' }}>
											<div className="px-3 bg-light text-gray-700">
												<h6 className="sticky-top flex-align-center justify-content-between mb-2 pt-3 pb-2 bg-light text-gray-600 border-bottom text-uppercase">
													<div className='flex-align-center'>
														<UserCirclePlus weight='fill' className="me-1" />
														<span style={{ lineHeight: 1 }}>Register a new member </span>
													</div>
													<div title="Cancel" onClick={() => { setShowAddMemberForm(false); }}>
														<X size={25} className='ptr' />
													</div>
												</h6>
												<div className='alert alert-primary grid-center mb-4 rounded-0 smaller'>
													<p className='mb-0'>Enter primary details for the new member. You can update their financial details later.</p>
													<CaretDown size={35} weight='light' className='p-2' />
												</div>

												{/* The form */}
												<form onSubmit={handleRegisterNewMember} className="px-sm-2 pb-5">
													{/* Husband Details */}
													<div className="mb-3">
														<label htmlFor="role" className="form-label fw-semibold">Role</label>
														<select id="role" name="role" className="form-select"
															value={formData.role}
															onChange={handleChange}
															required>
															<option value="" disabled className='p-2 px-3 small text-gray-500'>Select role</option>
															{memberRoles
																.map((val, index) => (
																	<option key={index} value={val} className='p-2 px-3 small text-capitalize'>
																		{val}
																	</option>
																))
															}
														</select>
													</div>
													<div className="mb-3">
														<label htmlFor="husbandFirstName" className="form-label fw-semibold">First Name</label>
														<input
															type="text"
															className="form-control"
															id="husbandFirstName"
															name="husbandFirstName"
															value={formData.husbandFirstName}
															onChange={handleChange}
															placeholder="Eg: Mugabe"
															required
														/>
													</div>
													<div className="mb-3">
														<label htmlFor="husbandLastName" className="form-label fw-semibold">Last Name</label>
														<input
															type="text"
															className="form-control"
															id="husbandLastName"
															name="husbandLastName"
															value={formData.husbandLastName}
															onChange={handleChange}
															placeholder="Eg: Alain"
															required
														/>
													</div>
													<div className="mb-3">
														<label htmlFor="username" className="form-label fw-semibold">Username</label>
														<input
															type="text"
															className="form-control"
															id="username"
															name="username"
															value={formData.username}
															onChange={handleChange}
															placeholder="Enter username"
															required
														/>
														{usernameTaken && (
															<div className="form-text px-2 py-1 bg-danger-subtle rounded-bottom-3 smaller"><WarningCircle size={22} weight='fill' className='me-1 opacity-50' /> Userame already taken</div>
														)}
													</div>
													<div className="mb-3">
														<label htmlFor="husbandPhone" className="form-label fw-semibold">Phone</label>
														<input
															type="text"
															className="form-control"
															id="husbandPhone"
															name="husbandPhone"
															value={formData.husbandPhone}
															onChange={handleChange}
															placeholder="Enter phone number"
															required
														/>
														{phoneNumberTaken && (
															<div className="form-text px-2 py-1 bg-danger-subtle rounded-bottom-3 smaller"><WarningCircle size={22} weight='fill' className='me-1 opacity-50' /> Phone already used</div>
														)}
													</div>
													<div className="mb-3">
														<label htmlFor="husbandEmail" className="form-label fw-semibold">Email</label>
														<input
															type="email"
															className="form-control"
															id="husbandEmail"
															name="husbandEmail"
															value={formData.husbandEmail}
															onChange={handleChange}
															placeholder="Enter email"
															required
														/>
														{emailTaken && (
															<div className="form-text px-2 py-1 bg-danger-subtle rounded-bottom-3 smaller"><WarningCircle size={22} weight='fill' className='me-1 opacity-50' /> Email already used</div>
														)}
													</div>

													{/* Password Fields */}
													<div className="mb-3 form-check">
														<input
															type="checkbox"
															className="form-check-input border-2 border-primary"
															id="autoGeneratePassword"
															checked={autoGeneratePassword}
															onChange={() => setAutoGeneratePassword(!autoGeneratePassword)}
														/>
														<label htmlFor="autoGeneratePassword" className="form-check-label">
															Auto-generate a strong password
														</label>
													</div>
													{!autoGeneratePassword && (
														<div className="mb-3">
															<label htmlFor="password" className="form-label fw-semibold">Password</label>
															<input type="password" className="form-control" id="password" placeholder="Enter password"
																value={registrationPassword}
																onChange={e => setRegistrationPassword(e.target.value)}
															/>
														</div>
													)}

													{/* Toggle Wife Details */}
													<div className="my-5 d-flex">
														<button
															type="button"
															className={`btn btn-sm btn-outline-${showWifeDetails ? 'danger' : 'secondary'} border-start-0 border-end-0 mx-auto rounded-0`}
															onClick={() => setShowWifeDetails(!showWifeDetails)}
														>
															{showWifeDetails ? 'Remove partner details' : 'Add partner details'}
														</button>
													</div>

													{/* Wife Details (optional) */}
													{showWifeDetails && (
														<>
															<div className="mb-3">
																<label htmlFor="wifeFirstName" className="form-label fw-semibold">Wife's First Name</label>
																<input
																	type="text"
																	className="form-control"
																	id="wifeFirstName"
																	name="wifeFirstName"
																	value={formData.wifeFirstName}
																	onChange={handleChange}
																	placeholder="Eg: Ingabire"
																/>
															</div>
															<div className="mb-3">
																<label htmlFor="wifeLastName" className="form-label fw-semibold">Wife's Last Name</label>
																<input
																	type="text"
																	className="form-control"
																	id="wifeLastName"
																	name="wifeLastName"
																	value={formData.wifeLastName}
																	onChange={handleChange}
																	placeholder="Eg: Laetitia"
																/>
															</div>
															<div className="mb-3">
																<label htmlFor="wifePhone" className="form-label fw-semibold">Wife's Phone</label>
																<input
																	type="text"
																	className="form-control"
																	id="wifePhone"
																	name="wifePhone"
																	value={formData.wifePhone}
																	onChange={handleChange}
																	placeholder="Enter phone number"
																/>
																{phoneNumberTaken && (
																	<div className="form-text px-2 py-1 bg-danger-subtle rounded-bottom-3 smaller"><WarningCircle size={22} weight='fill' className='me-1 opacity-50' /> Phone already used</div>
																)}
															</div>
															<div className="mb-3">
																<label htmlFor="wifeEmail" className="form-label fw-semibold">Wife's Email</label>
																<input
																	type="email"
																	className="form-control"
																	id="wifeEmail"
																	name="wifeEmail"
																	value={formData.wifeEmail}
																	onChange={handleChange}
																	placeholder="Enter email"
																/>
															</div>
														</>
													)}

													{/* Submit Button */}
													<button
														type="submit"
														className="btn btn-sm btn-dark flex-center w-100 mt-3 py-2 px-4 rounded-pill"
														disabled={!canRegisterNewMember}
													>
														Register
													</button>
												</form>
											</div>
										</div>
									</div>
								</>
							}

							{/* Edit member */}
							{showEditMemberForm &&
								<>
									<div className='position-fixed fixed-top inset-0 bg-black2 py-3 py-md-5 inx-high add-property-form'>
										<div className="container col-md-6 col-lg-5 col-xl-4 overflow-auto" style={{ animation: "zoomInBack .2s 1", maxHeight: '100%' }}>
											<div className="px-3 bg-light text-gray-700">
												<h6 className="sticky-top flex-align-center justify-content-between mb-2 pt-3 pb-2 bg-light text-gray-600 border-bottom text-uppercase">
													<div className='flex-align-center'>
														<Users weight='fill' className="me-1" />
														<span style={{ lineHeight: 1 }}>Edit Member</span>
													</div>
													<div title="Cancel" onClick={() => { setShowEditMemberForm(false); }}>
														<X size={25} className='ptr' />
													</div>
												</h6>
												<div className="mb-4">
													<div className='alert alert-primary grid-center mb-4 rounded-0 smaller'>
														<p className='mb-0'>Select whose information to edit and continue.</p>
														<CaretDown size={35} weight='light' className='p-2' />
													</div>
													<ul className="list-unstyled d-flex">
														<li className={`col-6 px-2 py-1 text-center small border-2 ${editHeadOfFamily ? 'border-bottom border-primaryColor text-primaryColor' : ''} ptr clickDown`}
															onClick={() => { setEditHeadOfFamily(true); }}
														>
															Husband
														</li>
														<li className={`col-6 px-2 py-1 text-center small border-2 ${!editHeadOfFamily ? 'border-bottom border-primaryColor text-primaryColor' : ''} ptr clickDown`}
															onClick={() => { setEditHeadOfFamily(false); }}
														>
															Wife
														</li>
													</ul>
												</div>

												<div className="flex-align-center gap-3 mb-3">
													<img src={
														editHeadOfFamily ? (
															selectedMember?.husbandAvatar ? selectedMember?.husbandAvatar : '/images/man_avatar_image.jpg'
														) : (
															selectedMember?.wifeAvatar ? selectedMember?.wifeAvatar : '/images/woman_avatar_image.jpg'
														)
													}
														alt={`${selectedMember?.husbandFirstName.slice(0, 1)}.${selectedMember?.husbandLastName}`}
														className="w-3rem ratio-1-1 object-fit-cover p-1 border border-3 border-secondary border-opacity-25 bg-light rounded-circle"
													/>
													<div className='fw-semibold smaller'>
														Edit {
															editHeadOfFamily ? (
																selectedMember?.husbandFirstName ? `${selectedMember?.husbandFirstName} ${selectedMember?.husbandLastName}` : 'Not provided'
															) : (
																selectedMember?.wifeFirstName ? `${selectedMember?.wifeFirstName} ${selectedMember?.wifeLastName}` : 'wife information'
															)
														}

													</div>
												</div>
												<hr />

												{/* The form */}
												<form onSubmit={(e) => e.preventDefault()} className="px-sm-2 pb-5">
													{/* Selected member info */}
													<div className="mb-3">
														<label htmlFor="role" className="form-label fw-semibold">Role</label>
														<select id="role" name="role" className="form-select"
															value={editSelectedmemberRole}
															onChange={e => setEditSelectedmemberRole(e.target.value)}
															required>
															<option value="" disabled className='p-2 px-3 small text-gray-500'>Select role</option>
															{memberRoles
																.map((val, index) => (
																	<option key={index} value={val} className='p-2 px-3 small text-capitalize'>
																		{val}
																	</option>
																))
															}
														</select>
													</div>
													<div className="mb-3">
														<label htmlFor="memberFirstName" className="form-label fw-semibold">First Name</label>
														<input
															type="text"
															className="form-control"
															id="memberFirstName"
															name="memberFirstName"
															value={editSelectedmemberFName}
															onChange={e => setEditSelectedmemberFName(e.target.value)}
															placeholder={`Eg: ${editHeadOfFamily ? 'Mugabe' : 'Ingabire'}`}
															required
														/>
													</div>
													<div className="mb-3">
														<label htmlFor="memberLastName" className="form-label fw-semibold">Last Name</label>
														<input
															type="text"
															className="form-control"
															id="memberLastName"
															name="memberLastName"
															value={editSelectedmemberLName}
															onChange={e => setEditSelectedmemberLName(e.target.value)}
															placeholder={`Eg: ${editHeadOfFamily ? 'Alain' : 'Laetitia'}`}
															required
														/>
													</div>
													<div className="mb-3">
														<label htmlFor="memberUsername" className="form-label fw-semibold">Username</label>
														<input
															type="text"
															className="form-control"
															id="memberUsername"
															name="memberUsername"
															value={editSelectedmemberUsername}
															onChange={e => setEditSelectedmemberUsername(e.target.value)}
															placeholder="Enter username"
															required
														/>
														{allMembers
															.find(m => (
																m.id !== selectedMember?.id &&
																normalizedLowercaseString(m.username) === normalizedLowercaseString(editSelectedmemberUsername)
															)) && (
																<div className="form-text px-2 py-1 bg-danger-subtle rounded-bottom-3 smaller"><WarningCircle size={22} weight='fill' className='me-1 opacity-50' /> Userame already taken</div>
															)
														}
													</div>
													<div className="mb-3">
														<label htmlFor="memberPhone" className="form-label fw-semibold">Phone</label>
														<input
															type="text"
															className="form-control"
															id="memberPhone"
															name="memberPhone"
															value={editSelectedmemberPhone}
															onChange={e => setEditSelectedmemberPhone(e.target.value)}
															placeholder="Enter phone number"
															required
														/>
													</div>
													<div className="mb-3">
														<label htmlFor="memberEmail" className="form-label fw-semibold">Email</label>
														<input
															type="email"
															className="form-control"
															id="memberEmail"
															name="memberEmail"
															value={editSelectedmemberEmail}
															onChange={e => setEditSelectedmemberEmail(e.target.value)}
															placeholder="Enter email"
															required
														/>
													</div>
													<button type="submit" className="btn btn-sm btn-outline-dark flex-center w-100 mt-5 py-2 px-4 rounded-pill clickDown" id="addSavingBtn"
														onClick={() => handleEditMemberInfo(selectedMember?.id, editHeadOfFamily ? 'husband' : 'wife')}
													>
														{!isWaitingFetchAction ?
															<>Save changes <FloppyDisk size={18} className='ms-2' /></>
															: <>Working <span className="spinner-grow spinner-grow-sm ms-2"></span></>
														}
													</button>
												</form>
											</div>
										</div>
									</div>
								</>
							}

							{/* Member Credits */}
							{showMemberFinances &&
								<>
									<div className='position-fixed fixed-top inset-0 bg-black2 inx-high add-property-form'>
										<div className="container h-100 offset-md-3 col-md-9 offset-xl-2 col-xl-10 px-0 overflow-auto" style={{ animation: "zoomInBack .2s 1", maxHeight: '100%' }}>
											<div className="container h-100 overflow-auto px-3 bg-light text-gray-700">
												<h6 className="sticky-top flex-align-center justify-content-between mb-2 pt-3 pb-2 bg-light text-gray-600 border-bottom">
													<div className='flex-align-center'>
														<img src={selectedMember?.husbandAvatar ? selectedMember?.husbandAvatar : '/images/man_avatar_image.jpg'}
															alt={`${selectedMember?.husbandFirstName.slice(0, 1)}.${selectedMember?.husbandLastName}`}
															className="w-3rem ratio-1-1 object-fit-cover p-1 border border-3 border-secondary border-opacity-25 bg-light rounded-circle"
														/>
														<span className='ms-2' style={{ lineHeight: 1 }}>
															{!showMemberRemoval ? 'Finances of' : 'Remove'} {`${selectedMember?.husbandFirstName} ${selectedMember?.husbandLastName}`}
														</span>
													</div>
													<div onClick={() => hideMemberFinances()}>
														<X size={25} className='ptr' />
													</div>
												</h6>

												<div className="d-sm-flex mb-3">
													<div className="position-relative flex-shrink-0 flex-center w-fit h-7rem px-4 fw-bold border border-3 border-secondary border-opacity-25 text-primaryColor rounded-pill" style={{ minWidth: '7rem' }}>
														<span className="display-3 fw-bold"><CountUp end={selectedMember?.shares} duration={0.6} /> </span> <small className='position-absolute start-50 bottom-0 border border-2 px-2 rounded-pill bg-light'>shares</small>
													</div>
													<div className='px-sm-3 py-3 smaller text-gray-700 fw-light'>
														Below is the financial status of {`${selectedMember?.husbandFirstName} ${selectedMember?.husbandLastName}`}, as recorded in the IKIMINA INGOBOKA saving management system. This status includes the total personal capital, comprising cotisation and social contributions, along with their credit status.
													</div>
												</div>

												{showMemberRemoval && (
													<div className="mb-4 p-3 border rounded-4 small shadow-sm">
														<div className='mb-2 text-danger-emphasis'>
															<p className='text-center'>
																Members are removed or deactivated according to their financial status. <span className='text-primary fw-semibold text-nowrap ptr clickDown' data-bs-toggle="collapse" data-bs-target="#readMore-member-removal-info">Read more</span>
															</p>
															<p className="p-3 bg-info-subtle rounded text-gray-700 collapse" id='readMore-member-removal-info'>
																If the cotisation exceeds the credit, the credit is cleared, and the remaining balance is retained. If the credit exceeds the cotisation, the cotisation is deducted, and the member remains in the credits records.
															</p>
														</div>
														<CaretDown size={35} weight='light' className='p-2 d-block mx-auto' />
													</div>
												)}

												<div className="d-xl-flex gap-3 mb-lg-4">
													{/* Cotisation and social */}
													<div className='col col-xl-5 mb-5'>
														<div className="fs-6 fw-semibold text-primaryColor text-center text-uppercase">Cotisation and social</div>
														<hr />
														<div className='overflow-auto'>
															<table className="table table-hover h-100">
																<thead className='table-secondary position-sticky top-0 inx-1 text-uppercase small'>
																	<tr>
																		<th className='py-3 text-nowrap text-gray-700 fw-normal'>Title</th>
																		<th className='py-3 text-nowrap text-gray-700 fw-normal'>Amount  <sub className='fs-60'>/RWF</sub></th>
																	</tr>
																</thead>
																<tbody>
																	<tr className={`small credit-row`}>
																		<td className={`ps-sm-3 border-bottom-3 border-end fw-bold`}>
																			Cotisation
																		</td>
																		<td className='text-primary-emphasis'>
																			<CurrencyText amount={selectedMember?.cotisation} />
																		</td>
																	</tr>
																	<tr className={`small credit-row`}>
																		<td className={`ps-sm-3 border-bottom-3 border-end fw-bold`}>
																			Social
																		</td>
																		<td className='text-primary-emphasis'>
																			<CurrencyText amount={selectedMember?.social} />
																		</td>
																	</tr>
																	<tr className={`small credit-row`}>
																		<td className={`ps-sm-3 border-bottom-3 border-end fw-bold`}>
																			Total
																		</td>
																		<td className='text-primary-emphasis text-decoration-underline'>
																			<CurrencyText amount={selectedMember?.cotisation + selectedMember?.social} />
																		</td>
																	</tr>
																</tbody>
															</table>
														</div>

														{/* <ul className="list-unstyled text-gray-700 px-2">
															<li className="py-1 w-100">
																<span className="flex-align-center">
																	<b className='fs-5'>{selectedMember?.shares} Shares</b>
																</span>
															</li>
															<li className="py-1 d-table-row">
																<span className='d-table-cell border-start border-secondary ps-2'>Cotisation:</span> <span className='d-table-cell ps-2'><CurrencyText amount={selectedMember?.cotisation} /></span>
															</li>
															<li className="py-1 d-table-row">
																<span className='d-table-cell border-start border-secondary ps-2'>Social:</span> <span className='d-table-cell ps-2'><CurrencyText amount={selectedMember?.social} /></span>
															</li>
															<li className="py-1 fs-5 d-table-row">
																<b className='d-table-cell'>Total:</b> <span className='d-table-cell ps-2'><CurrencyText amount={selectedMember?.cotisation + selectedMember?.social} /></span>
															</li>
														</ul> */}
													</div>
													{/* Loan status */}
													<div className="col mb-5 mb-xl-0">
														<div className="fs-6 fw-semibold text-primaryColor text-center text-uppercase">Loan status</div>
														<hr />
														{allLoans.filter(loan => (loan.memberId === selectedMember?.id && loan.loanTaken > 0)).length > 0 ? (
															<>
																{allLoans.filter(loan => (loan.memberId === selectedMember?.id && loan.loanTaken > 0))
																	.map((item, index) => {
																		const selectedLoan = item;
																		return (
																			<Fragment key={index} >
																				<div className='overflow-auto'>
																					<table className="table table-hover h-100 mb-0">
																						<thead className='table-secondary position-sticky top-0 inx-1 text-uppercase small'>
																							<tr text-uppercase>
																								<th className='py-3 text-nowrap text-gray-700 fw-normal'>Title</th>
																								<th className='py-3 text-nowrap text-gray-700 fw-normal'>Taken  <sub className='fs-60'>/RWF</sub></th>
																								<th className='py-3 text-nowrap text-gray-700 fw-normal'>Paid  <sub className='fs-60'>/RWF</sub></th>
																								<th className='py-3 text-nowrap text-gray-700 fw-normal'>Pending  <sub className='fs-60'>/RWF</sub></th>
																							</tr>
																						</thead>
																						<tbody>
																							<tr className={`small credit-row`}>
																								<td className={`ps-sm-3 border-bottom-3 border-end fw-bold`}>
																									Loan
																								</td>
																								<td>
																									<CurrencyText amount={selectedLoan?.loanTaken} />
																								</td>
																								<td className='text-primary-emphasis'>
																									<CurrencyText amount={selectedLoan?.loanPaid} />
																								</td>
																								<td className='text-warning-emphasis'>
																									<CurrencyText amount={selectedLoan?.loanPending} />
																								</td>
																							</tr>
																							<tr className={`small credit-row`}>
																								<td className={`ps-sm-3 border-bottom-3 border-end fw-bold`}>
																									Interest
																								</td>
																								<td>
																									<CurrencyText amount={selectedLoan?.interestTaken} />
																								</td>
																								<td className='text-primary-emphasis'>
																									<CurrencyText amount={selectedLoan?.interestPaid} />
																								</td>
																								<td className='text-warning-emphasis'>
																									<CurrencyText amount={selectedLoan?.interestPending} />
																								</td>
																							</tr>
																							<tr className={`small credit-row`}>
																								<td className={`ps-sm-3 border-bottom-3 border-end fw-bold`}>
																									Tranches
																								</td>
																								<td>
																									{selectedLoan?.tranchesTaken}
																								</td>
																								<td className='text-primary-emphasis'>
																									{selectedLoan?.tranchesPaid}
																								</td>
																								<td className='text-warning-emphasis'>
																									{selectedLoan?.tranchesPending}
																								</td>
																							</tr>
																						</tbody>
																					</table>
																				</div>
																			</Fragment>
																		)
																	})
																}
															</>
														) : (
															<>
																<EmptyBox
																	notFoundMessage={`No credit records found for this member.`}
																/>
															</>
														)}
													</div>
												</div>
												{/* Remove action */}
												{showMemberRemoval && (
													<>
														<DividerText text={<><UserMinus size={22} weight='fill' className='me-1 opacity-50' /> Remove this member</>} type='danger' noBorder className="mb-4" />
														<div className="mb-3">
															<div className="mb-3 pt-2 form-text bg-danger-subtle rounded">
																<p className='mb-2 px-2 text-danger-emphasis text-center smaller'>
																	This member will be removed or deactivated according to their financial status.
																</p>

																{allLoans.filter(loan => (loan.memberId === selectedMember?.id && loan.loanTaken > 0)).length > 0 ? (
																	<>
																		{allLoans.filter(loan => (loan.memberId === selectedMember?.id && loan.loanTaken > 0))
																			.map((item, index) => {
																				const selectedLoan = item;
																				const removeCompletely = (selectedMember?.cotisation + selectedMember?.social) > selectedLoan?.loanPending;
																				return (
																					<Fragment key={index} >
																						<div className='overflow-auto'>
																							<table className="table table-hover h-100 mb-0">
																								<thead className='table-warning position-sticky top-0 inx-1 1 text-uppercase small'>
																									<tr>
																										<th className='py-3 text-nowrap text-gray-700 fw-normal'>Cotisation</th>
																										<th className='py-3 text-nowrap text-gray-700 fw-normal'>
																											<div className="text-center">Comparison</div>
																										</th>
																										<th className='py-3 text-nowrap text-gray-700 fw-normal'>Pending Loan</th>
																									</tr>
																								</thead>
																								<tbody>
																									<tr>
																										<td className={`ps-sm-3 text-primary-emphasis`}>
																											<CurrencyText amount={selectedMember?.cotisation + selectedMember?.social} />
																										</td>
																										<td>
																											<div className="text-center">
																												{removeCompletely ? (
																													<GreaterThan size={25} />
																												) : (
																													<LessThan size={25} />
																												)}
																											</div>
																										</td>
																										<td className='text-warning-emphasis'>
																											<CurrencyText amount={selectedLoan?.loanPending} />
																										</td>
																									</tr>
																									<tr className="bg-transparent">
																										<td className={`ps-sm-3 border-bottom-3 border-end`}>
																											Decision
																										</td>
																										<td className='text-primary-emphasis small'>
																											<div className="flex-center gap-2">
																												{removeCompletely ? (
																													<span className="flex-align-center"><UserMinus size={22} weight='fill' className='me-1 opacity-50' /> Member is removed completely</span>
																												) : (
																													<span className="flex-align-center"><UserFocus size={22} weight='fill' className='me-1 opacity-50' /> Member stays under credit records</span>
																												)}
																											</div>
																										</td>
																										<td></td>
																									</tr>
																								</tbody>
																							</table>
																							<div className="d-flex">
																								<button className="col btn btn-sm text-dark w-100 flex-center py-2 border-dark rounded-0 clickDown"
																									onClick={() => hideMemberFinances()}
																								>
																									Cancel
																								</button>
																								<button className="col btn btn-sm btn-dark w-100 flex-center py-2 border-dark rounded-0 clickDown"
																									disabled={(isWaitingFetchAction)}
																									onClick={
																										() => {
																											customConfirmDialog({
																												message: (
																													<>
																														<h5 className='h6 border-bottom mb-3 pb-2'><UserMinus size={25} weight='fill' className='opacity-50' /> Removing a group member</h5>
																														<p className='fw-semibold'>
																															Are you sure to remove {`${selectedMember?.husbandFirstName} ${selectedMember?.husbandLastName}`} from the system ?
																														</p>
																													</>
																												),
																												type: 'warning',
																												action: () => handleRemoveMember(selectedMember?.husbandEmail),
																											});
																										}
																									}
																								>
																									{!isWaitingFetchAction ?
																										<>Remove <UserMinus size={18} className='ms-2' /></>
																										: <>Working <span className="spinner-grow spinner-grow-sm ms-2"></span></>
																									}
																								</button>
																							</div>
																						</div>
																					</Fragment>
																				)
																			})
																		}
																	</>
																) : (
																	<div className="alert">
																		<p>
																			<b>Decision: <UserMinus size={22} weight='fill' className='me-1 opacity-50' /> Removed completely</b>. A member with no credit records can withdraw their cotisation (if any) and will be removed from the active system members.
																		</p>
																		<div className="d-flex">
																			<button className="col btn btn-sm text-dark w-100 flex-center py-2 border-dark rounded-0 clickDown"
																				onClick={() => hideMemberFinances()}
																			>
																				Cancel
																			</button>
																			<button className="col btn btn-sm btn-dark w-100 flex-center py-2 border-dark rounded-0 clickDown"
																				disabled={(isWaitingFetchAction)}
																				onClick={
																					() => {
																						customConfirmDialog({
																							message: (
																								<>
																									<h5 className='h6 border-bottom mb-3 pb-2'><UserMinus size={25} weight='fill' className='opacity-50' /> Removing a group member</h5>
																									<p className='fw-semibold'>
																										Are you sure to remove {`${selectedMember?.husbandFirstName} ${selectedMember?.husbandLastName}`} from the system ?
																									</p>
																								</>
																							),
																							type: 'warning',
																							action: () => handleRemoveMember(selectedMember?.husbandEmail),
																						});
																					}
																				}
																			>
																				{!isWaitingFetchAction ?
																					<>Remove <UserMinus size={18} className='ms-2' /></>
																					: <>Working <span className="spinner-grow spinner-grow-sm ms-2"></span></>
																				}
																			</button>
																		</div>
																	</div>
																)}
															</div>
														</div>
													</>
												)}
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

	// Savings
	const Savings = () => {
		const [savingsToShow, setSavingsToShow] = useState(activeMembers);
		const [savingSearchValue, setSavingSearchValue] = useState('');

		// Search savings
		const savingSearcherRef = useRef();

		const filterSavingsBySearch = useCallback(() => {
			const searchString = savingSearchValue.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
			if (searchString !== null && searchString !== undefined && searchString !== '') {
				// showAllProperties(true);
				const filteredsavings = activeMembers.filter((val) => {
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
						(val.wifeLastName &&
							normalizedLowercaseString(val.wifeLastName)
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
				setSavingsToShow(filteredsavings);
			}
		}, [savingSearchValue]);

		const resetSavings = () => {
			setSavingsToShow(activeMembers);
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
		const [selectedMember, setSelectedMember] = useState(activeMembers[0]);
		const [savingRecordAmount, setSavingRecordAmount] = useState('');
		const [selectedMonths, setSelectedMonths] = useState([]);
		const [applyDelayPenalties, setApplyDelayPenalties] = useState(false);

		// Month selection
		const checkIfLate = (month) => {
			const today = new Date();
			const currentYear = today.getFullYear();
			const monthIndex = new Date(`${month} 1, ${currentYear}`).getMonth();
			const month10thDate = new Date(currentYear, monthIndex, 10);
			return today > month10thDate;
		};

		const totalSelectedMonths = useMemo(() => (
			selectedMonths.length
		), [selectedMonths]);

		const delayedMonths = useMemo(() => (
			selectedMonths.filter(m => checkIfLate(m)).length
		), [selectedMonths]);

		const handleMonthClick = (month, isLate) => {
			setSelectedMonths((prevSelectedMonths) => {
				const isAlreadySelected = prevSelectedMonths.includes(month);

				let updatedMonths;
				if (isAlreadySelected) {
					// Remove the month if it's already selected
					updatedMonths = prevSelectedMonths.filter((m) => m !== month);
				} else {
					// Add the month if it's not already selected
					updatedMonths = [...prevSelectedMonths, month];
				}

				// Update the saving amount based on the selected months
				const totalAmount = updatedMonths.reduce((total, currentMonth) => {
					if (applyDelayPenalties) {
						const isCurrentLate = checkIfLate(currentMonth);
						return total + (isCurrentLate ? 21000 : 20000);
					} else {
						return total + 20000;
					}
				}, 0);

				setSavingRecordAmount(totalAmount);
				return updatedMonths;
			});
		};

		// Handle add savings
		const handleAddSaving = async (id) => {
			if (!savingRecordAmount || Number(savingRecordAmount) <= 0) {
				return warningToast({ message: "Enter valid saving amount to continue" });
			}

			try {
				setIsWaitingFetchAction(true);

				const requestBody = savingRecordType === 'cotisation' ? {
					savings: selectedMonths,
					applyDelayPenalties,
					comment: savingRecordType[0].toUpperCase() + savingRecordType.slice(1)
				} : savingRecordType === 'social' ? {
					savingAmount: savingRecordAmount,
					comment: savingRecordType[0].toUpperCase() + savingRecordType.slice(1)
				} : null;

				const response = await fetch(`${BASE_URL}/member/${id}/${savingRecordType}`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(requestBody),
				});

				// Fetch error
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Error adding savings');
				}

				// Successful fetch
				const data = await response.json();
				successToast({ message: data.message });
				setShowAddSavingRecord(false);
				setErrorWithFetchAction(null);
				fetchMembers();
				fetchRecords();
			} catch (error) {
				setErrorWithFetchAction(error);
				cError("Error adding savings:", error);
				warningToast({ message: error.message || "An unknown error occurred", type: "danger" });
			} finally {
				setIsWaitingFetchAction(false);
			}
		};

		// Add multiple shares (umuhigo)
		const [showAddMultipleShares, setShowAddMultipleShares] = useState(false);
		const [multipleSharesAmount, setMultipleSharesAmount] = useState('');


		// Handle add savings
		const handleAddMultipleShares = async (id) => {
			if (!multipleSharesAmount || Number(multipleSharesAmount) <= 0) {
				return warningToast({ message: "Enter valid number of shares to continue" });
			}

			try {
				setIsWaitingFetchAction(true);

				const response = await fetch(`${BASE_URL}/member/${id}/multiple-shares`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						shares: multipleSharesAmount,
						comment: `Adding ${multipleSharesAmount} shares (Umuhigo)`,
					}),
				});

				// Fetch error
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Error adding multiple shares');
				}

				// Successful fetch
				const data = await response.json();
				successToast({ message: data.message });
				setShowAddMultipleShares(false);
				setErrorWithFetchAction(null);
				fetchMembers();
			} catch (error) {
				setErrorWithFetchAction(error);
				cError("Error adding multiple shares:", error);
				warningToast({ message: error.message || "An unknown error occurred", type: "danger" });
			} finally {
				setIsWaitingFetchAction(false);
			}
		};

		// const [shares, setShares] = useState(false);
		// const [showEditSharesRecord, setShowEditSharesRecord] = useState(false);

		// // Handle add shares
		// const handleEditShares = async (id) => {
		// 	if (!shares || Number(shares) <= 0) {
		// 		return warningToast({ message: "Enter valid number of shares to continue", type: 'gray-700' });
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
		// 		successToast({ message: data.message });
		// 		setShowEditSharesRecord(false); // Adjust based on your UI logic
		// 		setErrorWithFetchAction(null);
		// 		fetchMembers(); // Ensure the member data is updated
		// 		fetchRecords();
		// 	} catch (error) {
		// 		setErrorWithFetchAction(error);
		// 		cError("Error updating shares:", error);
		// 		warningToast({ message: error.message || "An unknown error occurred", type: "danger" });
		// 	} finally {
		// 		setIsWaitingFetchAction(false);
		// 	}
		// };

		return (
			<div className="pt-2 pt-md-0 pb-3">
				<div className="mb-3">
					<h2 className='text-appColor'><Coin weight='fill' className="me-1 opacity-50" /> Savings panel</h2>
					<div className="d-lg-flex align-items-center">
						<img src="/images/savings_visual.png" alt="" className='col-md-5' />
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

							<div className="d-lg-flex flex-wrap pb-5">
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
														<img src={husbandAvatar ? husbandAvatar : '/images/man_avatar_image.jpg'}
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
																	<span className='ms-auto py-1 px-2 border border-top-0 border-bottom-0 text-primaryColor flex-align-center ptr clickDown' title='Edit multiple shares'
																		onClick={() => { setSelectedMember(member); setShowAddMultipleShares(true) }}>
																		<EscalatorUp size={22} className='me-2' /> Umuhigo
																	</span>
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
														<button className="btn btn-sm text-primaryColor border-primaryColor w-100 flex-center rounded-0 clickDown"
															onClick={() => { setSelectedMember(member); setShowAddSavingRecord(true) }}
														><Plus className='me-1' /> Save amount</button>
													</div>
												</div>
											</div>
										)
									})
								}
							</div>

							{/* Record savings */}
							{showAddSavingRecord &&
								<>
									<div className='position-fixed fixed-top inset-0 flex-center py-3 py-md-5 bg-black2 inx-high add-property-form'>
										<div className="container col-md-6 col-lg-5 col-xl-4 my-auto peak-borders-b overflow-auto" style={{ animation: "zoomInBack .2s 1", maxHeight: '100%' }}>
											<div className="px-3 bg-light text-gray-700">
												<h6 className="sticky-top flex-align-center justify-content-between mb-4 pt-3 pb-2 bg-light text-gray-600 border-bottom text-uppercase">
													<div className='flex-align-center'>
														<CashRegister weight='fill' className="me-1" />
														<span style={{ lineHeight: 1 }}>Add monthly savings</span>
													</div>
													<div title="Cancel" onClick={() => { setShowAddSavingRecord(false); setSavingRecordAmount('') }}>
														<X size={25} className='ptr' />
													</div>
												</h6>
												<div className="flex-align-center gap-3 mb-3">
													<img src={selectedMember?.husbandAvatar ? selectedMember?.husbandAvatar : '/images/man_avatar_image.jpg'}
														alt={`${selectedMember?.husbandFirstName.slice(0, 1)}.${selectedMember?.husbandLastName}`}
														className="w-3rem ratio-1-1 object-fit-cover p-1 border border-3 border-secondary border-opacity-25 bg-light rounded-circle"
													/>
													<div className='smaller'>
														Add savings for {selectedMember?.husbandFirstName} {selectedMember?.husbandLastName}
													</div>
												</div>
												<hr />

												{/* The form */}
												<form onSubmit={(e) => e.preventDefault()} className="px-sm-2 pb-5">
													<div className="mb-3">
														<p className="small">
															<b>Saving type</b>: <span className="text-primaryColor text-capitalize">{savingRecordType}</span>
														</p>
														<ul className="list-unstyled d-flex">
															<li className={`col-6 px-2 py-1 text-center small border-2 ${savingRecordType === 'cotisation' ? 'border-bottom border-primaryColor text-primaryColor' : ''} ptr clickDown`}
																onClick={() => setSavingRecordType('cotisation')}
															>
																Cotisation
															</li>
															<li className={`col-6 px-2 py-1 text-center small border-2 ${savingRecordType === 'social' ? 'border-bottom border-primaryColor text-primaryColor' : ''} ptr clickDown`}
																onClick={() => setSavingRecordType('social')}
															>
																Social
															</li>
														</ul>
													</div>

													{savingRecordType === 'cotisation' && (
														<>
															<div className="mb-3 form-check">
																<input
																	type="checkbox"
																	className="form-check-input border-2 border-primary"
																	id="autoGeneratePassword"
																	checked={applyDelayPenalties}
																	onChange={() => {
																		setApplyDelayPenalties(!applyDelayPenalties);
																		setSelectedMonths([]);
																		setSavingRecordAmount('');
																	}}
																/>
																<label htmlFor="autoGeneratePassword" className="form-check-label">
																	Apply delay penalties
																</label>
															</div>
															<div className="mb-3">
																<ul className="list-unstyled d-flex gap-2 flex-wrap">
																	{['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => {
																		const monthValue = JSON.parse(selectedMember?.annualShares).find((m) => m.month === month);
																		const isPaid = monthValue?.paid || false;
																		const isLate = !isPaid && checkIfLate(month);
																		const isSelected = selectedMonths.includes(month);

																		return (
																			<li
																				key={index}
																				onClick={() => {
																					if (!isPaid) handleMonthClick(month, isLate);
																				}}
																				className={`border border-2 rounded-pill px-2 smaller user-select-none ${isPaid ? 'ptr-none bg-gray-600 text-light' : 'ptr'} clickDown ${isSelected ? 'bg-primaryColor text-light' : ''
																					} ${applyDelayPenalties && isLate && !isPaid ? 'text-danger' : ''}`}
																			>
																				{isPaid && <Check />} {month}
																			</li>
																		);
																	})}
																</ul>
															</div>
														</>

													)}
													<div className="mb-3">
														<label htmlFor="savingAmount" className="form-label fw-bold" required>
															Saving amount ({savingRecordAmount !== '' ? Number(savingRecordAmount).toLocaleString() : ''} RWF) {savingRecordType === 'cotisation' && savingRecordAmount !== '' && savingRecordAmount !== 0 && (
																<>
																	= {totalSelectedMonths} Share{totalSelectedMonths > 1 ? 's' : ''}
																</>
															)}
														</label>
														<input
															type="number"
															id="savingAmount"
															name="savingAmount"
															className="form-control"
															min="1"
															required
															placeholder="Enter amount"
															readOnly={savingRecordType === 'cotisation'}
															value={savingRecordAmount}
															onChange={(e) => setSavingRecordAmount(e.target.value)}
														/>
													</div>
													{savingRecordType === 'cotisation' && applyDelayPenalties && delayedMonths > 0 && (
														<div className="mb-3 p-2 form-text bg-danger-subtle rounded">
															<p className='mb-2 small text-danger-emphasis'>
																This applies a fine of <CurrencyText amount={1000} /> for each of the delayed months.
															</p>
															<ul className="list-unstyled d-flex gap-2 flex-wrap mb-0 mb-0">
																{selectedMonths
																	.filter(m => checkIfLate(m))
																	.map((month, index) => (
																		<li
																			key={index}
																			className={`border border-2 border-light-subtle text-danger-emphasis rounded-pill px-2 smaller user-select-none`}
																		>
																			<Gavel /> {month}
																		</li>
																	))}
															</ul>
														</div>
													)}
													<div className="mb-3 p-2 form-text bg-dark-subtle rounded">
														<p className='mb-2 small text-dark-emphasis'>
															Please verify the details before saving. This action is final and cannot be reversed.
														</p>
														<button type="submit" className="btn btn-sm btn-outline-dark flex-center w-100 py-2 px-4 rounded-pill clickDown" id="addSavingBtn"
															onClick={() => handleAddSaving(selectedMember?.id)}
														>
															{!isWaitingFetchAction ?
																<>Save amount <FloppyDisk size={18} className='ms-2' /></>
																: <>Working <span className="spinner-grow spinner-grow-sm ms-2"></span></>
															}
														</button>
													</div>
												</form>
											</div>
										</div>
									</div>
								</>
							}

							{/* Record multiple shares */}
							{showAddMultipleShares &&
								<>
									<div className='position-fixed fixed-top inset-0 flex-center py-3 py-md-5 bg-black2 inx-high add-property-form'>
										<div className="container col-md-6 col-lg-5 col-xl-4 my-auto peak-borders-b overflow-auto" style={{ animation: "zoomInBack .2s 1", maxHeight: '100%' }}>
											<div className="px-3 bg-light text-gray-700">
												<h6 className="sticky-top flex-align-center justify-content-between mb-4 pt-3 pb-2 bg-light text-gray-600 border-bottom text-uppercase">
													<div className='flex-align-center'>
														<CashRegister weight='fill' className="me-1" />
														<span style={{ lineHeight: 1 }}>Add multiple shares</span>
													</div>
													<div title="Cancel" onClick={() => { setShowAddMultipleShares(false); setMultipleSharesAmount('') }}>
														<X size={25} className='ptr' />
													</div>
												</h6>
												<div className="flex-align-center gap-3 mb-3">
													<img src={selectedMember?.husbandAvatar ? selectedMember?.husbandAvatar : '/images/man_avatar_image.jpg'}
														alt={`${selectedMember?.husbandFirstName.slice(0, 1)}.${selectedMember?.husbandLastName}`}
														className="w-3rem ratio-1-1 object-fit-cover p-1 border border-3 border-secondary border-opacity-25 bg-light rounded-circle"
													/>
													<div className='smaller'>
														Save multiple shares to {selectedMember?.husbandFirstName} {selectedMember?.husbandLastName}
													</div>
												</div>
												<ul className="list-unstyled text-gray-700 px-2 opacity-75 smaller fst-italic">
													<li className="py-1 w-100">
														<span className="flex-align-center">
															<b className='fs-5'>{selectedMember?.shares} Shares</b>
														</span>
													</li>
													<li className="py-1 d-table-row">
														<span className='d-table-cell border-start border-secondary ps-2'>Cotisation:</span> <span className='d-table-cell ps-2'><CurrencyText amount={selectedMember?.cotisation} /></span>
													</li>
													<li className="py-1 d-table-row">
														<span className='d-table-cell border-start border-secondary ps-2'>Social:</span> <span className='d-table-cell ps-2'><CurrencyText amount={selectedMember?.social} /></span>
													</li>
													<li className="py-1 fs-5 d-table-row">
														<b className='d-table-cell'>Total:</b> <span className='d-table-cell ps-2'><CurrencyText amount={selectedMember?.cotisation + selectedMember?.social} /></span>
													</li>
												</ul>
												<DividerText text="Add new shares" type='gray-300' className="mb-4" />
												{/* The form */}
												<form onSubmit={(e) => e.preventDefault()} className="px-sm-2 pb-5">
													<div className="mb-3">
														<label htmlFor="savingAmount" className="form-label fw-bold" required>
															Number of shares ({multipleSharesAmount !== '' ? `${multipleSharesAmount} Share${multipleSharesAmount > 1 ? 's' : ''}` : ''}) {multipleSharesAmount !== '' && multipleSharesAmount !== 0 && (
																<>
																	= <CurrencyText amount={Number(multipleSharesAmount) * 20000} />
																</>
															)}
														</label>
														<input
															type="number"
															id="savingAmount"
															name="savingAmount"
															className="form-control"
															min="1"
															required
															placeholder="Enter shares"
															value={multipleSharesAmount}
															onChange={(e) => setMultipleSharesAmount(e.target.value)}
														/>
														<div className="form-text text-info-emphasis fw-bold">Unit share value is <CurrencyText amount={20000} /> </div>
													</div>
													<div className="mb-3 p-2 form-text bg-dark-subtle rounded">
														<p className='mb-2 small text-dark-emphasis'>
															Please verify the details before saving. This action is final and cannot be reversed.
														</p>
														<button type="submit" className="btn btn-sm btn-outline-dark flex-center w-100 py-2 px-4 rounded-pill clickDown" id="addSavingBtn"
															onClick={() => handleAddMultipleShares(selectedMember?.id)}
														>
															{!isWaitingFetchAction ?
																<>Add shares <FloppyDisk size={18} className='ms-2' /></>
																: <>Working <span className="spinner-grow spinner-grow-sm ms-2"></span></>
															}
														</button>
													</div>
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
		const totalBoughtShares = activeMembers.reduce((sum, item) => sum + item.shares, 0);
		let totalSharesPercentage = 0;
		let totalMonetaryInterest = 0;
		let totalInterestReceivable = 0;
		let totalInterestRemains = 0;
		let totalAnnualShares = 0;

		const [showShareAnnualInterest, setShowShareAnnualInterest] = useState(false);
		const [keepAnnualInterest, setKeepAnnualInterest] = useState(false);
		// Condition the dates for interest distribution
		const currentDate = new Date();
		const currentYear = currentDate.getFullYear();
		const startCondition = new Date(`${currentYear}-12-26`); // 5 days before year end
		const endCondition = new Date(`${currentYear + 1}-01-10`); // 10 days into next year
		const isWithinCondition = currentDate >= startCondition && currentDate <= endCondition;

		// Handle interest distribution
		const distributeAnnualInterest = async (id) => {
			if (window.confirm(`Are you sure to proceed with ${keepAnnualInterest ? 'keeping' : 'withdrawing'} the annual interest ?`)) {
				try {
					setIsWaitingFetchAction(true);
					const response = await Axios.post(`/api/${keepAnnualInterest ? 'distribute' : 'withdraw'}-interest`, {
						annualReceivable: interestToReceive
					});
					// Successfull fetch
					const data = response.data;
					successToast({ message: data.message });
					setShowShareAnnualInterest(false);
					setErrorWithFetchAction(null);
					fetchLoans();
					fetchCredits();
				} catch (error) {
					setErrorWithFetchAction(error);
					cError("Error distributing interest:", error);
					warningToast({ message: error, type: "danger" });
				} finally {
					setIsWaitingFetchAction(false);
				}
			}

			// customConfirmDialog({
			// 	message: (
			// 		<>
			// 			<h5 className='h6 border-bottom mb-3 pb-2'><Receipt size={25} weight='fill' className='opacity-50' /> Annual interest distribution</h5>
			// 			<p>
			// 				Are you sure to proceed with {keepAnnualInterest ? 'keeping' : 'withdrawing'} the annual interest ?
			// 			</p>
			// 		</>
			// 	),
			// 	type: 'dark',
			// 	action: async () => {
			// 		try {
			// 			setIsWaitingFetchAction(true);
			// 			const response = await Axios.post(`/api/${keepAnnualInterest ? 'distribute' : 'withdraw'}-interest`);
			// 			// Successfull fetch
			// 			const data = response.data;
			// 			successToast({ message: data.message });
			// 			setShowShareAnnualInterest(false);
			// 			setErrorWithFetchAction(null);
			// 			fetchLoans();
			// 			fetchCredits();
			// 		} catch (error) {
			// 			setErrorWithFetchAction(error);
			// 			cError("Error distributing interest:", error);
			// 			warningToast({ message: error, type: "danger" });
			// 		} finally {
			// 			setIsWaitingFetchAction(false);
			// 		}
			// 	},
			// 	actionText: 'Yes, Continue',
			// });
		}

		// Annual interes records
		const [allAnnualInterest, setAllAnnualInterest] = useState([]);
		const [annualInterestToShow, setAnnualInterestToShow] = useState(allAnnualInterest);
		const [loadingAnnualInterest, setLoadingAnnualInterest] = useState(false);
		const [errorLoadingAnnualInterest, setErrorLoadingAnnualInterest] = useState(false);

		const [selectedAnnualInterestRecord, setSelectedAnnualInterestRecord] = useState([]);
		const [showAnnualInterestRecords, setShowAnnualInterestRecords] = useState(false);
		const [showSelectedAnnualInterestRecord, setShowSelectedAnnualInterestRecord] = useState(false);

		const interestRecentYears = useMemo((() => (
			allAnnualInterest.length
		)), []);

		// Fetch annaul interest records
		const fetchAnnualInterests = async () => {
			try {
				setLoadingAnnualInterest(true);
				const response = await Axios.get(`/api/annualInterests`);
				const data = response.data;
				setAllAnnualInterest(data);
				setAnnualInterestToShow(data);
				setErrorLoadingAnnualInterest(null);
			} catch (error) {
				setErrorLoadingAnnualInterest("Failed to load loans. Click the button to try again.");
				warningToast({ message: errorLoadingAnnualInterest });
				console.error("Error fetching loans:", error);
			} finally {
				setLoadingAnnualInterest(false);
			}
		};

		useEffect(() => {
			fetchAnnualInterests();
		}, []);

		return (
			<div className="pt-2 pt-md-0 pb-3">
				<div className="mb-3">
					<h2 className='text-appColor'><Coins weight='fill' className="me-1 opacity-50" /> Interest panel</h2>
					<div className="d-lg-flex align-items-center">
						<img src="/images/interests_visual.png" alt="" className='d-none d-lg-block col-md-5' />
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
						<table className="table table-hover h-100">
							<thead className='table-success position-sticky top-0 inx-1 1 text-uppercase small'>
								<tr>
									<th className='py-3 text-nowrap text-gray-700 fw-normal'>N°</th>
									<th className='py-3 text-nowrap text-gray-700 fw-normal'>Member</th>
									<th className='py-3 text-nowrap text-gray-700 fw-normal'>Annual shares</th>
									<th className='py-3 text-nowrap text-gray-700 fw-normal'>Share % to {totalBoughtShares}</th>
									<th className='py-3 text-nowrap text-gray-700 fw-normal'>Interest <sub className='fs-60'>/RWF</sub></th>
									<th className='py-3 text-nowrap text-gray-700 fw-normal'>Receivable<sub className='fs-60'>/RWF</sub></th>
									<th className='py-3 text-nowrap text-gray-700 fw-normal'>Remains<sub className='fs-60'>/RWF</sub></th>
								</tr>
							</thead>
							<tbody>
								{activeMembers
									.sort((a, b) => a.husbandFirstName.localeCompare(b.husbandFirstName))
									.map((item, index) => {
										const memberNames = `${item.husbandFirstName} ${item.husbandLastName}`;
										const annualShares = JSON.parse(item.annualShares).filter(share => share.paid).length;
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
										totalAnnualShares += annualShares;

										return (
											<tr key={index} className="small cursor-default clickDown interest-row">
												<td className="border-bottom-3 border-end">
													{index + 1}
												</td>
												<td className='text-nowrap'>
													{memberNames}
												</td>
												<td>
													{annualShares}
												</td>
												<td className="text-nowrap">
													{sharesPercentage} %
												</td>
												<td className="text-nowrap text-gray-700">
													<CurrencyText amount={interest} smallCurrency />
												</td>
												<td className="text-nowrap text-success">
													<CurrencyText amount={interestReceivable} smallCurrency />
												</td>
												<td className="text-nowrap text-gray-700">
													<CurrencyText amount={interestRemains} smallCurrency />
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
										{totalMembers} <span className="fs-60">members</span>
									</td>
									<td className='text-nowrap'>
										<div className="d-grid">
											{totalAnnualShares}
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
						<p className='mb-0 p-2 smaller'>
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

				{/* Share interest */}
				{/* {isWithinCondition && ( */}
				<ContentToggler
					state={showShareAnnualInterest}
					setState={setShowShareAnnualInterest}
					text="Share Annual Interest"
					className="ms-auto"
				/>
				{/* )} */}

				{showShareAnnualInterest && (
					<>
						{/* Share interest */}
						<div className="my-5">
							<h3 className="grid-center mb-4 text-primaryColor text-uppercase">
								<span className='d-block text-center'>Chose how to share the annual interest.</span>
								<CaretDown size={45} className='p-2 fw-light' />
							</h3>
							<ul className="list-unstyled d-flex gap-2">
								<li className={`col px-2 py-1 text-center small user-select-none ${!keepAnnualInterest ? 'bg-primaryColor text-gray-200' : 'border border-primaryColor text-primaryColor'} rounded-pill ptr clickDown`}
									onClick={() => { setKeepAnnualInterest(false); }}
								>
									Withdraw interest
								</li>
								<li className={`col px-2 py-1 text-center small user-select-none ${keepAnnualInterest ? 'bg-primaryColor text-gray-200' : 'border border-primaryColor text-primaryColor'} rounded-pill ptr clickDown`}
									onClick={() => { setKeepAnnualInterest(true); }}
								>
									Keep interest
								</li>
							</ul>
							<div className="alert bg-primaryColor text-light small rounded-4">
								{keepAnnualInterest ? (
									<>
										<p className=''>
											<Info size={22} weight='fill' className='me-1 opacity-50' /> The interest earned by each member will be added to their total cotisation amount, along with the corresponding share count. Only the maximum share multiples (<CurrencyText amount={20000} /> per share) of the earned interest will be applied, while any remaining balance will be carried forward as the initial interest for the following year.
										</p>
									</>
								) : (
									<>
										<p className=''>
											<Info size={22} weight='fill' className='me-1 opacity-50' /> The interest earned by each member will be calculated and withdrawn as requested. Only the maximum share multiples (<CurrencyText amount={20000} /> per share) of the earned interest are eligible for withdrawal, while any remaining balance will be carried forward as the initial interest for the following year.
										</p>
									</>
								)}

								<div className="modal-footer mt-3">
									<button
										type="button"
										className={`btn btn-sm me-3 text-gray-200 border-0 clickDown`}
										disabled={isWaitingFetchAction}
										onClick={() => setShowShareAnnualInterest(false)}
									>
										Cancel
									</button>
									<button
										type="submit"
										className={`btn bg-gray-200 text-primaryColor flex-align-center px-3 rounded-pill clickDown`}
										disabled={isWaitingFetchAction}
										onClick={() => distributeAnnualInterest()}
									>
										{!isWaitingFetchAction ? (
											<>
												{keepAnnualInterest ? 'Keep interest' : 'Withdraw interest'} <CaretRight />
											</>
										) : (
											<>
												Working <div className="spinner-border spinner-border-sm ms-2"></div>
											</>
										)}
									</button>
								</div>
							</div>
						</div>
					</>
				)}

				{/* Recent records */}
				<ContentToggler
					state={showAnnualInterestRecords}
					setState={setShowAnnualInterestRecords}
					text="Interest Partition Records"
					className="ms-auto"
				/>

				{showAnnualInterestRecords && (
					<>
						<div className="d-flex flex-wrap justify-content-center gap-2 gap-lg-3 rounded">
							{allAnnualInterest
								.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
								.map((record, index) => (
									<div key={index} className='w-fit p-3 p-lg-4 border bg-primary-subtle ptr clickDown'
										onClick={() => { setSelectedAnnualInterestRecord(record); setShowSelectedAnnualInterestRecord(true) }}
									>
										{record.year}
									</div>
								))
							}
						</div>

						{showSelectedAnnualInterestRecord && (
							<>
								<div className='position-fixed fixed-top inset-0 bg-black2 inx-high add-property-form'>
									<div className="container h-100 offset-md-3 col-md-9 offset-xl-2 col-xl-10 px-0 overflow-auto" style={{ animation: "zoomInBack .2s 1", maxHeight: '100%' }}>
										<div className="container h-100 overflow-auto px-3 bg-light text-gray-700">
											<h6 className="sticky-top flex-align-center justify-content-between mb-2 pt-3 pb-2 bg-light text-gray-600 border-bottom text-uppercase">
												<div className='flex-align-center'>
													<Coins weight='fill' className="me-1" />
													<span style={{ lineHeight: 1 }}> {selectedAnnualInterestRecord?.year} interest partition </span>
												</div>
												<div title="Cancel" onClick={() => { setShowSelectedAnnualInterestRecord(false); }}>
													<X size={25} className='ptr' />
												</div>
											</h6>
											<div className='overflow-auto mb-5'>
												<table className="table table-hover h-100">
													<thead className='table-success position-sticky top-0 inx-1 1 text-uppercase small'>
														<tr>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>N°</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Member</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Annual shares</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Interest received<sub className='fs-60'>/RWF</sub></th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Interest remains<sub className='fs-60'>/RWF</sub></th>
														</tr>
													</thead>
													<tbody>
														{allAnnualInterest
															.filter((record) => record.year === selectedAnnualInterestRecord.year)
															.map((record, index) => {
																const memberStatus = JSON.parse(record.memberStatus);
																return (
																	<Fragment key={index}>
																		<tr className="small cursor-default clickDown interest-row">
																			<td className="border-bottom-3 border-end bg-primaryColor text-light">
																				{selectedAnnualInterestRecord.year}
																			</td>
																			<td className='text-nowrap'>
																				Total shares : {record.totalShares}
																			</td>
																			<td>
																			</td>
																			<td></td>
																			<td></td>
																		</tr>

																		{memberStatus
																			.map((member, index) => {
																				const associatedMember = activeMembers.find(m => m.id === member.id);
																				const memberNames = `${associatedMember.husbandFirstName} ${associatedMember.husbandLastName}`;
																				return (
																					<tr key={index} className="small cursor-default clickDown interest-row">
																						<td className="border-bottom-3 border-end">
																							{index + 1}
																						</td>
																						<td className='text-nowrap'>
																							{memberNames}
																						</td>
																						<td>
																							{member.annualShares}
																						</td>
																						<td className="text-nowrap fw-bold text-success">
																							<CurrencyText amount={member.interestReceived} smallCurrency />
																						</td>
																						<td className="text-nowrap text-gray-700">
																							<CurrencyText amount={member.interestRemains} smallCurrency />
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
																				{totalMembers} <span className="fs-60">members</span>
																			</td>
																			<td className='text-nowrap'>
																				<div className="d-grid">
																					<CurrencyText amount={
																						JSON.parse(record.memberStatus).reduce((sum, item) => sum + item.annualShares, 0)
																					} smallCurrency />
																				</div>
																			</td>
																			<td className="text-nowrap">
																				<div className="d-grid">
																					<CurrencyText amount={
																						JSON.parse(record.memberStatus).reduce((sum, item) => sum + item.interestReceived, 0)
																					} smallCurrency />
																				</div>
																			</td>
																			<td className="text-nowrap fw-bold">
																				<CurrencyText amount={
																					JSON.parse(record.memberStatus).reduce((sum, item) => sum + item.interestRemains, 0)
																				} smallCurrency />
																			</td>
																		</tr>
																	</Fragment>
																)
															})
														}
													</tbody>
												</table>
											</div>
										</div>
										{/* The table */}
									</div>
								</div>
							</>
						)}
					</>
				)}


			</div>
		)
	}

	// Credit
	const Credit = () => {
		const [activeLoanSection, setActiveLoanSection] = useState(
			allCredits.filter(cr => cr.status === 'pending').length > 0
				? 'pending'
				: 'approved'
		);
		const [activeLoanSectionColor, setActiveLoanSectionColor] = useState('#a3d5bb75');

		// Filtering credits
		const [membersToShow, setMembersToShow] = useState(allMembers || []);
		const [memberSearchValue, setMemberSearchValue] = useState('');

		// Search members
		const memberSearcherRef = useRef();

		const filterMembersBySearch = useCallback(() => {
			const searchString = normalizedLowercaseString(memberSearchValue).trim();

			if (searchString) {
				const filteredMembers = activeAndInactiveMembers.filter((val) => {
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
						(val.wifeLastName &&
							normalizedLowercaseString(val.wifeLastName)
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
		}, [memberSearchValue]);

		const resetMembers = () => {
			setMembersToShow(activeAndInactiveMembers);
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
		const [showSelectedMemberCreditRecords, setShowSelectedMemberCreditRecords] = useState(false);

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

		// handle approving a credit
		const approveCreditRequest = async (id) => {
			try {
				setIsWaitingFetchAction(true);
				const response = await fetch(`${BASE_URL}/credit/${id}/approve`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ status: 'approved' }),
				});

				// Fetch error
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Error approving credit request');
				}

				// Successful fetch
				const data = await response.json();
				successToast({ message: data.message });
				resetConfirmDialog();
				setErrorWithFetchAction(null);
				fetchCredits();
				fetchLoans();
				fetchFigures();
			} catch (error) {
				setErrorWithFetchAction(error);
				cError("Error approving credit:", error);
				warningToast({ message: error.message, type: "danger" });
			} finally {
				setIsWaitingFetchAction(false);
			}
		};

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
				successToast({ message: data.message });
				resetPrompt();
				setErrorWithFetchAction(null);
				fetchCredits();
			} catch (error) {
				setErrorWithFetchAction(error);
				cError("Error fetching members:", error);
				warningToast({ message: error, type: "danger" });
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
				successToast({ message: data.message });
				resetConfirmDialog();
				setErrorWithFetchAction(null);
				fetchCredits();
			} catch (error) {
				setErrorWithFetchAction(error);
				cError("Error fetching members:", error);
				warningToast({ message: error, type: "danger" });
			} finally {
				setIsWaitingFetchAction(false);
			}
		}

		/**
		 * Pay Loans
		 */

		const [payLoanAmount, setPayLoanAmount] = useState('');
		const [payInterestAmount, setPayInterestAmount] = useState('');
		const [payTranchesAmount, setPayTranchesAmount] = useState('');

		const resetPaymentinputs = () => {
			setPayLoanAmount('');
			setPayInterestAmount('');
			setPayTranchesAmount('');
		}

		const handeLoanPaymemnt = async (id) => {
			if (payLoanAmount <= 0 || payTranchesAmount <= 0) {
				return warningToast({ message: 'Enter payment amount to continue' })
			}

			try {
				setIsWaitingFetchAction(true);
				const response = await Axios.put(`/loan/${id}/pay`, {
					loanToPay: payLoanAmount,
					interestToPay: payInterestAmount,
					tranchesToPay: payTranchesAmount,
				});
				// Successfull fetch
				const data = response.data;
				successToast({ message: data.message });
				resetPaymentinputs();
				setErrorWithFetchAction(null);
				fetchLoans();
				fetchCredits();
			} catch (error) {
				setErrorWithFetchAction(error);
				cError("Error fetching members:", error);
				warningToast({ message: error, type: "danger" });
			} finally {
				setIsWaitingFetchAction(false);
			}
		}

		/**
		 * Apply loan penalties
		 */

		const [applyCreditPenalty, setApplyCreditPenalty] = useState(false);
		const [creditPenaltyAmount, setCreditPenaltyAmount] = useState('');
		const [penaltyComment, setPenaltyComment] = useState('');

		const handleApplyCreditPenalty = async (id) => {
			if (!creditPenaltyAmount || Number(creditPenaltyAmount) <= 0) {
				return warningToast({ message: 'Enter valid penalty amount to continue', type: 'gray-700' })
			}

			try {
				setIsWaitingFetchAction(true);

				const response = await Axios.post(`/user/${id}/credit-penalty`, {
					secondaryType: 'Credit penalty',
					penaltyAmount: creditPenaltyAmount,
					comment: penaltyComment
				});

				// Successful fetch
				const data = response.data; // Axios stores the response data in `data`
				successToast({ message: data.message });
				setApplyCreditPenalty(false);
				setErrorWithFetchAction(null);
				fetchMembers();
				fetchRecords();
			} catch (error) {
				console.error('Caught Error:', error);

				// Handle axios error
				const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred";
				setErrorWithFetchAction(errorMessage);
				cError("Error applying penalties:", error);
				warningToast({ message: errorMessage, })
			} finally {
				setIsWaitingFetchAction(false);
			}
		};

		return (
			<div className="pt-2 pt-md-0 pb-3">
				<h2 className='text-appColor'><Blueprint weight='fill' className="me-1 opacity-50" /> Credit panel</h2>

				<Form onSubmit={e => e.preventDefault()} className='sticky-top col-lg-6 col-xxl-4 members-search-box'>
					<Form.Control ref={memberSearcherRef} type="text" placeholder="🔍 Search members..." id='memberSearcher' className="h-2_5rem border border-2 bg-gray-200 rounded-0"
						value={memberSearchValue} onChange={(e) => setMemberSearchValue(e.target.value)}
						onKeyUp={e => { (e.key === "Enter") && filterMembersBySearch() }}
					/>
					{memberSearchValue !== '' && (
						<X className='ptr r-middle-m me-1' onClick={() => setMemberSearchValue('')} />
					)}
				</Form>

				{loadingMembers && (<LoadingIndicator icon={<Blueprint size={80} className="loading-skeleton" />} />)}
				{!loadingMembers && errorLoadingMembers && (
					<FetchError
						errorMessage={errorLoadingMembers}
						refreshFunction={() => fetchMembers()}
						className="mb-5 mt-4"
					/>
				)}
				{!loadingMembers && !errorLoadingMembers && membersToShow.length === 0 && (
					<NotFound
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
											<img src={member.husbandAvatar ? member.husbandAvatar : '/images/man_avatar_image.jpg'}
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

						{/* Member Credits */}
						{showSelectedMemberCredits &&
							<>
								<div className='position-fixed fixed-top inset-0 bg-black2 inx-high add-property-form'>
									<div className="container h-100 offset-md-3 col-md-9 offset-xl-2 col-xl-10 px-0 overflow-auto" style={{ animation: "zoomInBack .2s 1", maxHeight: '100%' }}>
										<div className="container h-100 overflow-auto px-3 bg-light text-gray-700">
											<h6 className="sticky-top flex-align-center justify-content-between mb-4 pt-3 pb-2 bg-light text-gray-600 border-bottom">
												<div className='flex-align-center'>
													<img src={selectedMember?.husbandAvatar ? selectedMember?.husbandAvatar : '/images/man_avatar_image.jpg'}
														alt={`${selectedMember?.husbandFirstName.slice(0, 1)}.${selectedMember?.husbandLastName}`}
														className="w-3rem ratio-1-1 object-fit-cover p-1 border border-3 border-secondary border-opacity-25 bg-light rounded-circle"
													/>
													<span className='ms-2' style={{ lineHeight: 1 }}>
														Credits of {`${selectedMember?.husbandFirstName} ${selectedMember?.husbandLastName}`}
													</span>
												</div>
												<div onClick={() => { setShowSelectedMemberCredits(false); setShowSelectedMemberCreditRecords(false) }}>
													<X size={25} className='ptr' />
												</div>
											</h6>
											{allLoans.filter(loan => (loan.memberId === selectedMember?.id && loan.loanTaken > 0)).length > 0 ? (
												<>
													{allLoans.filter(loan => (loan.memberId === selectedMember?.id && loan.loanTaken > 0))
														.map((item, index) => {
															const selectedLoan = item;
															return (
																<Fragment key={index} >
																	<div className="d-xl-flex gap-3 pb-5">
																		{/* Loan status */}
																		<div className="col member-loan-status mb-4 mb-xl-0">
																			<div className="fs-6 fw-semibold text-primaryColor text-center text-uppercase">Loan status</div>
																			<hr />
																			<div className='overflow-auto'>
																				<table className="table table-hover h-100">
																					<thead className='table-secondary position-sticky top-0 inx-1 text-uppercase small'>
																						<tr>
																							<th className='py-3 text-nowrap text-gray-700 fw-normal'>Title</th>
																							<th className='py-3 text-nowrap text-gray-700 fw-normal'>Taken  <sub className='fs-60'>/RWF</sub></th>
																							<th className='py-3 text-nowrap text-gray-700 fw-normal'>Paid  <sub className='fs-60'>/RWF</sub></th>
																							<th className='py-3 text-nowrap text-gray-700 fw-normal'>Pending  <sub className='fs-60'>/RWF</sub></th>
																						</tr>
																					</thead>
																					<tbody>
																						<tr className={`small credit-row`}>
																							<td className={`ps-sm-3 border-bottom-3 border-end fw-bold`}>
																								Loan
																							</td>
																							<td>
																								<CurrencyText amount={selectedLoan?.loanTaken} />
																							</td>
																							<td className='text-primary-emphasis'>
																								<CurrencyText amount={selectedLoan?.loanPaid} />
																							</td>
																							<td className='text-warning-emphasis'>
																								<CurrencyText amount={selectedLoan?.loanPending} />
																							</td>
																						</tr>
																						<tr className={`small credit-row`}>
																							<td className={`ps-sm-3 border-bottom-3 border-end fw-bold`}>
																								Interest
																							</td>
																							<td>
																								<CurrencyText amount={selectedLoan?.interestTaken} />
																							</td>
																							<td className='text-primary-emphasis'>
																								<CurrencyText amount={selectedLoan?.interestPaid} />
																							</td>
																							<td className='text-warning-emphasis'>
																								<CurrencyText amount={selectedLoan?.interestPending} />
																							</td>
																						</tr>
																						<tr className={`small credit-row`}>
																							<td className={`ps-sm-3 border-bottom-3 border-end fw-bold`}>
																								Tranches
																							</td>
																							<td>
																								{selectedLoan?.tranchesTaken}
																							</td>
																							<td className='text-primary-emphasis'>
																								{selectedLoan?.tranchesPaid}
																							</td>
																							<td className='text-warning-emphasis'>
																								{selectedLoan?.tranchesPending}
																							</td>
																						</tr>
																					</tbody>
																				</table>
																			</div>

																			{allCredits.filter(cr => cr.memberId === selectedMember?.id).length > 0 && (
																				<>
																					<div className="d-flex">
																						<div className='col p-2'>
																							<div className='flex-align-center text-muted border-bottom smaller'><Calendar className='me-1 opacity-50' /> <span className="text-nowrap">First loan</span></div>
																							<div className='text-center bg-gray-300'>
																								<FormatedDate date={allCredits
																									.sort((a, b) => new Date(a.requestDate) - new Date(b.requestDate))
																									.filter(cr => cr.memberId === selectedMember?.id)[0].requestDate
																								} />
																							</div>
																						</div>
																						<div className='col p-2'>
																							<div className='flex-align-center text-muted border-bottom smaller'><Calendar className='me-1 opacity-50' /> <span className="text-nowrap">Recent loan</span></div>
																							<div className='text-center bg-gray-300'>
																								<FormatedDate date={allCredits
																									.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate))
																									.filter(cr => cr.memberId === selectedMember?.id)[0].requestDate
																								} />
																							</div>
																						</div>
																					</div>
																				</>
																			)}
																		</div>

																		{/* Loan payment form */}
																		<div className='col col-xl-5 member-loan-payment'>
																			{selectedLoan?.loanPending > 0 ? (
																				<>
																					<div className="fs-6 fw-semibold text-primaryColor text-center text-uppercase">Payment</div>
																					<hr />
																					<div>
																						<div className='mb-3'>
																							<div className="d-sm-flex px-1">
																								<div className="col mb-2 ps-2 mb-sm-0 border-start border-secondary border-opacity-50">
																									<div className='small mb-sm-3'>Remaining Loan</div>
																									<div className="px-2 text-danger-emphasis">
																										<CurrencyText amount={selectedLoan?.loanPending} />
																									</div>
																								</div>
																								<div className='col'>
																									<label htmlFor="payLoanAmount" className="form-label" required>Pay loan ({payLoanAmount !== '' ? Number(payLoanAmount).toLocaleString() : ''} RWF )</label>
																									<input type="number" id="payLoanAmount" name="payLoanAmount" className="form-control rounded-0 border-secondary border-opacity-50 shadow-none" min="1" required placeholder="Enter amount"
																										value={payLoanAmount}
																										onChange={e => setPayLoanAmount(e.target.value)}
																									/>
																								</div>
																							</div>
																							{payLoanAmount > Number(selectedLoan?.loanPending) && (
																								<div className='form-text d-flex gap-2 bg-danger-subtle mt-2 p-2 rounded-bottom-4'>
																									<Warning />
																									<span className='fs-75'>Amount to pay cannot be grater than the remaining amount</span>
																								</div>
																							)}
																						</div>

																						{selectedLoan?.interestPending > 0 && (
																							<div className='mb-3'>
																								<div className="d-sm-flex px-1">
																									<div className="col mb-2 ps-2 mb-sm-0 border-start border-secondary border-opacity-50">
																										<div className='small mb-sm-3'>Remaining Interest</div>
																										<div className="px-2 text-danger-emphasis">
																											<CurrencyText amount={selectedLoan?.interestPending} />
																										</div>
																									</div>
																									<div className='col'>
																										<label htmlFor="payInterestAmount" className="form-label" required>Pay interest ({payInterestAmount !== '' ? Number(payInterestAmount).toLocaleString() : ''} RWF )</label>
																										<input type="number" id="payInterestAmount" name="payInterestAmount" className="form-control rounded-0 border-secondary border-opacity-50 shadow-none" min="1" required placeholder="Enter amount"
																											value={payInterestAmount}
																											onChange={e => setPayInterestAmount(e.target.value)}
																										/>
																									</div>
																								</div>
																								{payInterestAmount > Number(selectedLoan?.interestPending) && (
																									<div className='form-text d-flex gap-2 bg-danger-subtle mt-2 p-2 rounded-bottom-4'>
																										<Warning />
																										<span className='fs-75'>Amount to pay cannot be grater than the remaining amount</span>
																									</div>
																								)}
																							</div>
																						)}

																						<div className='mb-3'>
																							<div className="d-sm-flex px-1">
																								<div className="col mb-2 ps-2 mb-sm-0 border-start border-secondary border-opacity-50">
																									<div className='small mb-sm-3'>Remaining Traches</div>
																									<div className="px-2 text-danger-emphasis">
																										{selectedLoan?.tranchesPending}
																									</div>
																								</div>
																								<div className='col'>
																									<label htmlFor="payTranchesAmount" className="form-label" required>Pay tranches ( {payTranchesAmount} )</label>
																									<input type="number" id="payTranchesAmount" name="payTranchesAmount" className="form-control rounded-0 border-secondary border-opacity-50 shadow-none" min="1" required placeholder="Enter amount"
																										value={payTranchesAmount}
																										onChange={e => setPayTranchesAmount(e.target.value)}
																									/>
																								</div>
																							</div>
																							{payTranchesAmount > Number(selectedLoan?.tranchesPending) && (
																								<div className='form-text d-flex gap-2 bg-danger-subtle mt-2 p-2 rounded-bottom-4'>
																									<Warning />
																									<span className='fs-75'>Amount to pay cannot be grater than the remaining amount</span>
																								</div>
																							)}
																						</div>
																					</div>

																					<div className="d-flex">
																						<button className="col btn btn-sm text-dark w-100 flex-center py-2 border-dark rounded-0 clickDown"
																							onClick={() => resetPaymentinputs()}
																						>
																							Clear
																						</button>
																						<button className="col btn btn-sm btn-dark w-100 flex-center py-2 border-dark rounded-0 clickDown"
																							disabled={(
																								payLoanAmount > Number(selectedLoan?.loanPending)
																								|| payInterestAmount > Number(selectedLoan?.interestPending)
																								|| payTranchesAmount > Number(selectedLoan?.tranchesPending)
																								|| isWaitingFetchAction
																							)}
																							onClick={() => { handeLoanPaymemnt(selectedLoan?.id); }}
																						>
																							{!isWaitingFetchAction ?
																								<>Save payment <FloppyDisk size={18} className='ms-2' /></>
																								: <>Working <span className="spinner-grow spinner-grow-sm ms-2"></span></>
																							}
																						</button>
																					</div>

																				</>
																			) : (
																				<div className="grid-center fs-5 py-5">
																					<CheckCircle size={40} weight='fill' className="w-4rem h-4rem d-block mx-auto mb-2 text-success" />
																					<p className="text-center text-gray-800 fw-light small">Requested loan is fully paid.</p>
																				</div>
																			)}
																		</div>
																	</div>

																	<hr className='mt-0 mb-4' />
																	{/* Credit penalties */}
																	<div className="mb-3">
																		<ContentToggler
																			state={applyCreditPenalty}
																			setState={setApplyCreditPenalty}
																			text="Apply penalties"
																			className="ms-auto"
																		/>

																		{applyCreditPenalty && (
																			<>
																				<form onSubmit={e => e.preventDefault()} className="px-sm-2 pb-5">
																					<div className="mb-3">
																						<label htmlFor="penaltyAmount" className="form-label fw-bold" required>Penalty amount ({creditPenaltyAmount !== '' ? Number(creditPenaltyAmount).toLocaleString() : ''} RWF )</label>
																						<input type="number" id="penaltyAmount" name="penaltyAmount" className="form-control" min="1" required placeholder="Enter amount"
																							value={creditPenaltyAmount}
																							onChange={e => setCreditPenaltyAmount(e.target.value)}
																						/>
																					</div>
																					<div className="mb-3">
																						<label htmlFor="penaltyComment" className="form-label fw-bold" required>Penalty comment</label>
																						<textarea rows={3} id="penaltyComment" name="penaltyComment" className="form-control" placeholder="Enter comment"
																							value={penaltyComment}
																							onChange={e => setPenaltyComment(e.target.value)}
																						></textarea>
																					</div>

																					<button type="submit" className="btn btn-sm btn-outline-dark flex-center w-100 mt-5 py-2 px-4 rounded-pill clickDown" id="applyPenaltyBtn"
																						onClick={() => handleApplyCreditPenalty(selectedMember?.id)}
																					>
																						{!isWaitingFetchAction ?
																							<>Apply penalty <Gavel size={18} className='ms-2' /></>
																							: <>Working <span className="spinner-grow spinner-grow-sm ms-2"></span></>
																						}
																					</button>
																				</form>
																			</>
																		)}
																	</div>

																	{/* Toggle Credit Records */}

																	<ContentToggler
																		state={showSelectedMemberCreditRecords}
																		setState={setShowSelectedMemberCreditRecords}
																		text={<>Credit records for {selectedMember?.husbandFirstName}</>}
																		className="ms-auto"
																	/>

																	{showSelectedMemberCreditRecords && (
																		<>
																			<div className='overflow-auto'>
																				<table className="table table-hover h-100">
																					<thead className='table-success position-sticky top-0 inx-1 1 text-uppercase small'>
																						<tr>
																							<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
																							<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ minWidth: '10rem' }}>Member</th>
																							<th className='py-3 text-nowrap text-gray-700 fw-normal'>Amount  <sub className='fs-60'>/RWF</sub></th>
																							<th className='py-3 text-nowrap text-gray-700 fw-normal'>Date & Interval</th>
																							<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ maxWidth: '13rem' }} >Comment</th>
																							<th className='py-3 text-nowrap text-gray-700 fw-normal'>Credit Status</th>
																						</tr>
																					</thead>
																					<tbody>

																						{allCredits.filter(cr => (cr.memberId === selectedMember?.id && cr.status === 'approved'))
																							.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
																							.map((credit, index) => {
																								const associatedMember = allMembers.find(m => m.id === credit.memberId);
																								const memberNames = `${associatedMember.husbandFirstName} ${associatedMember.husbandLastName}`;
																								const creditInterest = Number(credit.creditAmount) * (5 / 100);

																								return (
																									<tr key={index} className={`small loan-row`}>
																										<td className={`ps-sm-3 border-bottom-3 border-end`}>
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
																												><Receipt weight='fill' size={18} className='me-1' /> Tableau d'amortissement</span>
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
																							})
																						}
																					</tbody>
																				</table>
																			</div>
																		</>
																	)}

																</Fragment>
															)
														})
													}
												</>
											) : (
												<>
													<EmptyBox
														notFoundMessage={`No credit records found for this member. It appears they have not received a loan yet.`}
														refreshKeyword="Got it"

														refreshFunction={() => setShowSelectedMemberCredits(false)}
													/>
												</>
											)}
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
												<table className="table table-hover h-100">
													<thead className='table-warning position-sticky top-0 inx-1 1 text-uppercase small'>
														<tr>
															<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ minWidth: '10rem' }}>Member</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Amount  <sub className='fs-60'>/RWF</sub></th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Date & Interval</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ maxWidth: '13rem' }} >Comment</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Action</th>
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
																	<tr key={index} className={`small loan-row`}>
																		<td className={`ps-sm-3 border-bottom-3 border-end`}>
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
																				><Receipt weight='fill' size={18} className='me-1' /> Tableau d'amortissement</span>
																			</div>
																		</td>
																		<td style={{ maxWidth: '13rem' }}>
																			{credit.comment}
																		</td>
																		<td className='text-nowrap fs-75'>
																			<div className="dim-100 d-flex">
																				<button className='btn btn-sm text-primary-emphasis border-primary border-opacity-25 mb-auto rounded-0'
																					onClick={
																						() => {
																							if (Number(allFigures?.balance) < Number(credit.creditAmount)) {
																								toast({
																									message:
																										<>
																											<WarningCircle size={22} weight='fill' className='me-1 opacity-50' />
																											<span className="ms-1">Insufficient balance. <CurrencyText amount={Number(allFigures?.balance)} smallCurrency className="fw-semibold ms-1" />. Credit can not be approved.</span>
																										</>,
																									type: "warning",
																									selfClose: false,
																								});
																							} else {
																								customConfirmDialog({
																									message: (
																										<>
																											<h5 className='h6 border-bottom mb-3 pb-2 text-uppercase'><HandCoins size={25} weight='fill' className='opacity-50' /> Approve credit request</h5>
																											<p className='text-warning'>
																												This will approve a credit of <CurrencyText amount={Number(credit.creditAmount)} /> requested by {memberNames}.<br /><br />Are you sure to continue?
																											</p>
																										</>
																									),
																									type: 'gray-800',
																									action: () => approveCreditRequest(credit.id),
																								});
																							}
																						}
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
																											<h5 className='h6 border-bottom mb-3 pb-2 text-uppercase'><ReceiptX size={25} weight='fill' className='opacity-50' /> Reject credit request</h5>
																											<p>
																												Provide a reason for rejecting this request and any helpful feedback.
																											</p>
																										</>
																									),
																									type: 'gray-800',
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
															})
														}
													</tbody>
												</table>
											</div>
										)}
										{/* Zero content - no credits */}
										{creditsToShow.filter(cr => cr.status === 'pending').length === 0 && (
											<NotFound
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
												<table className="table table-hover h-100">
													<thead className='table-success position-sticky top-0 inx-1 1 text-uppercase small'>
														<tr>
															<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ minWidth: '10rem' }}>Member</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Amount  <sub className='fs-60'>/RWF</sub></th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Date & Interval</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ maxWidth: '13rem' }} >Comment</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Credit Status</th>
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
																	<tr key={index} className={`small loan-row`}>
																		<td className={`ps-sm-3 border-bottom-3 border-end`}>
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
																				><Receipt weight='fill' size={18} className='me-1' /> Tableau d'amortissement</span>
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
															})
														}
													</tbody>
												</table>
											</div>
										)}
										{/* Zero content - no credits */}
										{creditsToShow.filter(cr => cr.status === 'approved').length === 0 && (
											<NotFound
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
												<table className="table table-hover h-100">
													<thead className='table-danger position-sticky top-0 inx-1 1 text-uppercase small'>
														<tr>
															<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ minWidth: '10rem' }}>Member</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Amount  <sub className='fs-60'>/RWF</sub></th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Date & Interval</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ maxWidth: '13rem' }} >Comment</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ maxWidth: '13rem' }} >Rejection</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Action</th>
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
																	<tr key={index} className={`small cursor-default clickDown loan-row`}>
																		<td className={`ps-sm-3 border-bottom-3 border-end`}>
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
																				><Receipt weight='fill' size={18} className='me-1' /> Tableau d'amortissement</span>
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
																										A credit request of <CurrencyText amount={Number(credit.creditAmount)} /> submitted by {memberNames} will be restored and marked as pending for further actions.
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
											<NotFound
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
											<div className="container offset-md-3 col-md-9 offset-xl-2 col-xl-10 px-0 peak-borders-b overflow-auto" style={{ animation: "zoomInBack .2s 1", maxHeight: '100%' }}>
												<div className="px-3 bg-light text-gray-700">
													<h6 className="sticky-top flex-align-center justify-content-between mb-2 pt-3 pb-2 bg-light text-gray-600 border-bottom text-uppercase">
														<div className='flex-align-center text-primaryColor'>
															<Receipt weight='fill' className="me-1" />
															<span style={{ lineHeight: 1 }}>Tableau d'amortissement</span>
														</div>
														<div onClick={() => { setShowBackfillPlanCard(false); }}>
															<X size={25} className='ptr' />
														</div>
													</h6>
													<div className="pb-5">
														<div className='alert d-lg-flex align-items-end gap-3 border-0 rounded-0 shadow-sm'>
															<div className='fw-light'>
																{associatedMember[0] && (
																	<>
																		<div className='d-flex gap-2 mb-2'>
																			<img src={associatedMember[0].husbandAvatar ? associatedMember[0].husbandAvatar : '/images/man_avatar_image.jpg'}
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
																	<div className='text-center bg-gray-300'><FormatedDate date={selectedCredit.requestDate} /></div>
																</div>
																<div className='col px-2'>
																	<div className='flex-align-center smaller'><Calendar className='me-1 opacity-50' /> <span className="text-nowrap">Payment end date</span></div>
																	<div className='text-center bg-gray-300'><FormatedDate date={selectedCredit.dueDate} /></div>
																</div>
															</div>
														</div>
														<ul className="list-unstyled d-flex flex-wrap gap-3 px-1 px-sm-2 px-lg-3 small">
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
															<table className="table table-hover h-100">
																<thead className='table-primary position-sticky top-0 inx-1 1 text-uppercase small'>
																	<tr>
																		<th className='ps-sm-3 py-3 text-nowrap text-gray-700 fw-normal'>Tranche</th>
																		<th className='py-3 text-nowrap text-gray-700 fw-normal fw-normal'>Backfill amount</th>
																		<th className='py-3 text-nowrap text-gray-700 fw-normal fw-normal'>Backfill date</th>
																	</tr>
																</thead>
																<tbody>
																	{JSON.parse(selectedCredit.creditPayment)
																		.sort((a, b) => a.tranchNumber - b.tranchNumber) // Sort tranches
																		.map((item, index) => {
																			const amountToPay = Number(selectedCredit.creditAmount) + (Number(selectedCredit.creditAmount) * (5 / 100));
																			const backFillAmount = amountToPay / selectedCredit.tranches;
																			return (
																				<tr key={index} className="small expense-row">
																					<td className="ps-sm-3 border-bottom-3 border-end">
																						{item.tranchNumber}
																					</td>
																					<td>
																						<CurrencyText amount={backFillAmount} />
																					</td>
																					<td>
																						<FormatedDate date={item.tranchDueDate} />
																					</td>
																				</tr>
																			)
																		})
																	}
																</tbody>
															</table>
														</div>

														{activeLoanSection === 'pending' && selectedCredit.status === 'pending' && (
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
																	onClick={
																		() => {
																			if (Number(allFigures?.balance) < Number(selectedCredit.creditAmount)) {
																				toast({
																					message:
																						<>
																							<WarningCircle size={22} weight='fill' className='me-1 opacity-50' />
																							<span className="ms-1">Insufficient balance. <CurrencyText amount={Number(allFigures?.balance)} smallCurrency className="fw-semibold ms-1" />. Credit can not be approved.</span>
																						</>,
																					type: "warning",
																					selfClose: false,
																				});
																			} else {
																				customConfirmDialog({
																					message: (
																						<>
																							<h5 className='h6 border-bottom mb-3 pb-2 text-uppercase'><HandCoins size={25} weight='fill' className='opacity-50' /> Approve credit request</h5>
																							<p className='text-warning'>
																								This will approve a credit of <CurrencyText amount={Number(selectedCredit.creditAmount)} /> requested by {`${associatedMember[0].husbandFirstName} ${associatedMember[0].husbandLastName}`}.<br /><br />Are you sure to continue?
																							</p>
																						</>
																					),
																					type: 'gray-800',
																					action: () => approveCreditRequest(selectedCredit.id),
																				});
																			}
																		}
																	}
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
		const [expenseRecordType, setExpenseRecordType] = useState('');
		const [expenseRecordAmount, setExpenseRecordAmount] = useState('');
		const [expenseComment, setExpenseComment] = useState('');

		// Handle add expense
		const handleAddExpense = async (e) => {
			e.preventDefault();
			if (!expenseRecordAmount || Number(expenseRecordAmount) <= 0) {
				return warningToast({ message: 'Enter valid expense amount to continue', type: 'gray-700' })
			}

			try {
				setIsWaitingFetchAction(true);

				const response = await fetch(`${BASE_URL}/records/recordExpense`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						secondaryType: expenseRecordType,
						expenseAmount: expenseRecordAmount,
						comment: expenseComment[0].toUpperCase() + expenseComment.slice(1)
					}),
				});

				// Fetch error
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Error recording the expense');
				}

				// Successful fetch
				const data = await response.json();
				successToast({ message: data.message });
				setShowAddExpenseRecord(false);
				setErrorWithFetchAction(null);
				fetchMembers();
				fetchRecords();
			} catch (error) {
				setErrorWithFetchAction(error);
				cError("Error adding savings:", error);
				warningToast({ message: error.message || "An unknown error occurred", type: "danger" });
			} finally {
				setIsWaitingFetchAction(false);
			}
		};

		useEffect(() => {
			if (activeTransactionSection === 'withdrawals') {
				setActiveTransactionSectionColor('#f4e4b675');
			} else if (activeTransactionSection === 'deposits') {
				setActiveTransactionSectionColor('#a3d5bb75');
			} else if (activeTransactionSection === 'penalties') {
				setActiveTransactionSectionColor('#c1c9eb75');
			}
		}, [activeTransactionSection]);

		return (
			<div className="pt-2 pt-md-0 pb-3">
				<div className="mb-3">
					<div className="d-flex flex-wrap justify-content-between align-items-center">
						<h2 className='text-appColor'><CashRegister weight='fill' className="me-1 opacity-50" /> Transactions panel</h2>
						<div className="ms-auto d-flex gap-1">
							<button className='btn btn-sm flex-center gap-1 text-primaryColor fw-semibold border-secondary border border-opacity-25 clickDown'
								onClick={() => { setActiveTransactionSection('withdrawals'); setShowAddExpenseRecord(true) }}>
								<Plus /> Record expenses
							</button>
						</div>
					</div>
					<div className="d-lg-flex align-items-center">
						<img src="/images/transactions_visual.png" alt="" className='d-none d-lg-block col-md-5' />
						<div className='alert mb-4 rounded-0 smaller fw-light'>
							The transactions panel provides a detailed record of all financial activities, ensuring complete transparency and accountability. Here, you can track and review logs of deposits, withdrawals/expenses, and penalties, offering a comprehensive view of each member's financial transactions for easy monitoring and management.
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
							<p className='mb-0 fs-75'>( {recordsToShow.filter(cr => cr.recordType === 'expense').length} )</p>
						</div>
						<div className={`col d-flex flex-column flex-sm-row column-gap-2 p-2 border-top border-bottom border-2 border-success border-opacity-25 tab-selector ${activeTransactionSection === 'deposits' ? 'active' : ''} user-select-none ptr clickDown`}
							style={{ '--_activeColor': '#a3d5bb' }}
							onClick={() => { setActiveTransactionSection('deposits'); }}
						>
							<h5 className='mb-0 small'>Deposits</h5>
							<p className='mb-0 fs-75'>( {recordsToShow.filter(cr => cr.recordType === 'deposit').length} )</p>
						</div>
						<div className={`col d-flex flex-column flex-sm-row column-gap-2 p-2 border-top border-bottom border-2 border-primary border-opacity-25 tab-selector ${activeTransactionSection === 'penalties' ? 'active' : ''} user-select-none ptr clickDown`}
							style={{ '--_activeColor': '#c1c9eb' }}
							onClick={() => { setActiveTransactionSection('penalties'); }}
						>
							<h5 className='mb-0 small'>Penalties</h5>
							<p className='mb-0 fs-75'>( {recordsToShow.filter(cr => cr.recordType === 'penalty').length} )</p>
						</div>
					</div>

					{/* Selected content */}

					{loadingMembers && (<LoadingIndicator icon={<Users size={80} className="loading-skeleton" />} />)}
					{!loadingMembers && errorLoadingMembers && (
						<FetchError
							errorMessage={errorLoadingMembers}
							refreshFunction={() => fetchMembers()}
							className="mb-5 mt-4"
						/>
					)}
					{!loadingMembers && !errorLoadingMembers && membersToShow.length === 0 && (
						<NotFound
							notFoundMessage="No member found"
							icon={<Users size={80} className="text-center w-100 mb-3 opacity-50" />}
							refreshFunction={fetchMembers}
						/>
					)}
					{!loadingMembers && !errorLoadingMembers && membersToShow.length > 0 && (
						<div style={{ minHeight: '60vh' }}>
							{/* Expenses table */}
							{activeTransactionSection === 'withdrawals' && (
								<>
									<div className='overflow-auto'>
										<table className="table table-hover h-100">
											<thead className='table-warning position-sticky top-0 inx-1 1 text-uppercase small'>
												<tr>
													<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
													<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ minWidth: '10rem' }}>Type</th>
													<th className='py-3 text-nowrap text-gray-700 fw-normal'>Amount  <sub className='fs-60'>/RWF</sub></th>
													<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ maxWidth: '13rem' }} >Comment</th>
													<th className='py-3 text-nowrap text-gray-700 fw-normal'>Date</th>
												</tr>
											</thead>
											<tbody>
												{recordsToShow
													.filter(cr => cr.recordType === 'expense')
													.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
													.map((record, index) => {
														const associatedMember = allMembers.find(m => m.id === record.memberId);
														const memberNames = `${associatedMember.husbandFirstName} ${associatedMember.husbandLastName}`;

														return (
															<tr key={index} className="small cursor-default clickDown expense-row">
																<td className="ps-sm-3 border-bottom-3 border-end">
																	{index + 1}
																</td>
																<td>
																	{record.recordSecondaryType}
																</td>
																<td>
																	<CurrencyText amount={Number(record.recordAmount)} />
																</td>
																<td>
																	{record.comment}
																</td>
																<td className="text-nowrap" style={{ maxWidth: '13rem' }}>
																	<FormatedDate date={record.createdAt} />
																</td>
															</tr>
														)
													})
												}
											</tbody>
										</table>
									</div>

									{showAddExpenseRecord &&
										<>
											<div className='position-fixed fixed-top inset-0 bg-black2 py-3 py-md-5 inx-high add-property-form'>
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
																	value={expenseRecordType}
																	onChange={(e) => setExpenseRecordType(e.target.value)}
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
																<input type="number" id="expenseAmount" name="expenseAmount" className="form-control" min="1" required placeholder="Enter amount"
																	value={expenseRecordAmount}
																	onChange={e => setExpenseRecordAmount(e.target.value)}
																/>
															</div>
															<div className="mb-3">
																<label htmlFor="expenseComment" className="form-label fw-bold" required>Expense comment</label>
																<textarea rows={3} id="expenseComment" name="expenseComment" className="form-control" placeholder="Enter comment"
																	value={expenseComment}
																	onChange={e => setExpenseComment(e.target.value)}
																></textarea>
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

							{/* Deposits table */}
							{activeTransactionSection === 'deposits' && (
								<div className='overflow-auto'>
									<table className="table table-hover h-100">
										<thead className='table-success position-sticky top-0 inx-1 1 text-uppercase small'>
											<tr>
												<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
												<th className='py-3 text-nowrap text-gray-700 fw-normal'>Member</th>
												<th className='py-3 text-nowrap text-gray-700 fw-normal'>Amount  <sub className='fs-60'>/RWF</sub></th>
												<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ maxWidth: '13rem' }} >Comment</th>
												<th className='py-3 text-nowrap text-gray-700 fw-normal'>Date</th>
											</tr>
										</thead>
										<tbody>
											{recordsToShow
												.filter(cr => cr.recordType === 'deposit')
												.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
												.map((record, index) => {
													const associatedMember = allMembers.find(m => m.id === record.memberId);
													const memberNames = `${associatedMember.husbandFirstName} ${associatedMember.husbandLastName}`;

													return (
														<tr key={index} className="small cursor-default clickDown expense-row">
															<td className="ps-sm-3 border-bottom-3 border-end">
																{index + 1}
															</td>
															<td className="text-nowrap">
																{memberNames}
															</td>
															<td>
																<CurrencyText amount={Number(record.recordAmount)} />
															</td>
															<td>
																{record.comment}
															</td>
															<td className="text-nowrap" style={{ maxWidth: '13rem' }}>
																<FormatedDate date={record.createdAt} />
															</td>
														</tr>
													)
												})
											}
										</tbody>
									</table>
								</div>
							)}

							{activeTransactionSection === 'penalties' && (
								<div className='overflow-auto'>
									<table className="table table-hover h-100">
										<thead className='table-primary position-sticky top-0 inx-1 1 text-uppercase small'>
											<tr>
												<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
												<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ minWidth: '10rem' }}>Member</th>
												<th className='py-3 text-nowrap text-gray-700 fw-normal'>Amount  <sub className='fs-60'>/RWF</sub></th>
												<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ maxWidth: '13rem' }} >Comment</th>
												<th className='py-3 text-nowrap text-gray-700 fw-normal'>Date</th>
											</tr>
										</thead>
										<tbody>
											{recordsToShow
												.filter(cr => cr.recordType === 'penalty')
												.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
												.map((record, index) => {
													const associatedMember = allMembers.find(m => m.id === record.memberId);
													const memberNames = `${associatedMember.husbandFirstName} ${associatedMember.husbandLastName}`;

													return (
														<tr key={index} className="small cursor-default clickDown expense-row">
															<td className="ps-sm-3 border-bottom-3 border-end">
																{index + 1}
															</td>
															<td className="text-nowrap">
																{memberNames}
															</td>
															<td>
																<CurrencyText amount={Number(record.recordAmount)} />
															</td>
															<td>
																{record.comment}
															</td>
															<td className="text-nowrap" style={{ maxWidth: '13rem' }}>
																<FormatedDate date={record.createdAt} />
															</td>
														</tr>
													)
												})
											}
										</tbody>
									</table>
								</div>
							)}
						</div>
					)}
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

		// Count report values
		let totalCotisationsAndShares = 0;
		let generalTotal = generalReport.balance;

		// Handle exports
		const reportViewRef = useRef();

		return (
			<div className="pt-2 pt-md-0 pb-3">
				<div className="mb-3">
					<h2 className='text-appColor'><Files weight='fill' className="me-1 opacity-50" /> Report panel</h2>
					<div className="d-lg-flex align-items-center">
						<img src="/images/reports_visual.png" alt="" className='d-none d-lg-block col-md-5' />
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
						<Calendar size={25} className='me-2' /> <FormatedDate date={new Date()} monthFormat='numeric' hour12Format={true} />
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
										<table className="table table-hover h-100">
											<thead className='table-success position-sticky top-0 inx-1 1 text-uppercase small'>
												<tr>
													<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
													<th className='py-3 text-nowrap text-gray-700 fw-normal'>Libelle</th>
													<th className='py-3 text-nowrap text-gray-700 fw-normal'>Montant <sub className='fs-60'>/RWF</sub></th>
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
														<tr key={index} className="small cursor-default clickDown expense-row">
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
										<table className="table table-hover h-100">
											<thead className='table-success position-sticky top-0 inx-1 1 text-uppercase small'>
												<tr>
													<th className='py-3 text-nowrap text-gray-700 fw-normal'>Actif</th>
													<th className='py-3 text-nowrap text-gray-700 fw-normal'>Montant <sub className='fs-60'>/RWF</sub></th>
													<th className='py-3 text-nowrap text-gray-700 fw-normal'>Passif</th>
													<th className='py-3 text-nowrap text-gray-700 fw-normal'>Montant <sub className='fs-60'>/RWF</sub></th>
												</tr>
											</thead>
											<tbody>
												<tr className="small cursor-default clickDown general-report-row">
													<td className="ps-sm-3 border-bottom-3 border-end fw-bold">
														Balance
													</td>
													<td className="text-nowrap fw-bold">
														<CurrencyText amount={generalReport.balance} />
													</td>
													<td></td>
													<td></td>
												</tr>
												{activeMembers
													.sort((a, b) => a.husbandFirstName.localeCompare(b.husbandFirstName))
													.map((item, index) => {
														const memberNames = `${item.husbandFirstName} ${item.husbandLastName}`;
														const memberCostisation = item.cotisation;
														const memberSocial = item.social;
														const memberBalance = memberCostisation + memberSocial;

														const memberCredits = allLoans.find(loan => loan.memberId === item.id);
														const pendingCredit = memberCredits.loanPending;

														totalCotisationsAndShares += memberBalance;
														generalTotal += pendingCredit;

														return (
															<tr key={index} className="small cursor-default clickDown general-report-row">
																<td className="ps-sm-3">
																	<b>{index + 1}</b>. {memberNames}
																</td>
																<td className="text-nowrap">
																	Credit: <CurrencyText amount={pendingCredit} boldAmount smallCurrency className='text-gray-700' />
																</td>
																<td>
																	{memberNames}
																</td>
																<td className='text-nowrap'>
																	Part: <CurrencyText amount={memberCostisation} boldAmount smallCurrency className='text-gray-700' /> | Social: <CurrencyText amount={Number(memberSocial)} boldAmount smallCurrency className='text-gray-700' />
																</td>
															</tr>
														)
													})
												}
												<tr className="small cursor-default clickDown general-report-row fw-bold" style={{ borderTopWidth: '2px' }} >
													<td></td>
													<td></td>
													<td>
														Cotisation + Social
													</td>
													<td className="text-nowrap">
														<CurrencyText amount={totalCotisationsAndShares} />
													</td>
												</tr>
												<tr className="small cursor-default clickDown general-report-row fw-bold">
													<td></td>
													<td></td>
													<td>
														Verify
													</td>
													<td className="text-nowrap">
														<CurrencyText amount={generalTotal - totalCotisationsAndShares} />
													</td>
												</tr>
												<tr className="small cursor-default clickDown general-report-row fw-bold fs-5">
													<td className="ps-sm-3">General Total:</td>
													<td>
														<CurrencyText amount={generalTotal} /> {/* Must be equal */}
													</td>
													<td>General Total:</td>
													<td className="text-nowrap">
														<CurrencyText amount={generalTotal} /> {/* Must be equal */}
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
									<p>Done by <b>Accountant {accountantNames}</b></p>
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
						<p className='mb-0 p-2 smaller'>
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
				- Send updates to members about savings, penalties, or loan approvals.
				- Handle inquiries from members.
				- Manage email and SMS notifications.
			</section>
		)
	}

	// Settings
	const Settings = () => {
		return (
			<SystemSettings />
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

	const [showNotifications, setShowNotifications] = useState(false);
	const [hasNewNotifications, setHasNewNotifications] = useState(false);

	useEffect(() => {
		if (allCredits.filter(cr => cr.status === 'pending').length > 0) {
			setHasNewNotifications(true);
		} else {
			setHasNewNotifications(false);
		}
	}, [allCredits]);

	useEffect(() => {
		if (hasNewNotifications) {
			messageToast({
				message: <>
					<div className="flex-center">
						You have new notifications <ArrowSquareOut size={20} weight='bold' className='ms-2 text-warning ptr clickDown'
							onClick={() => { setShowNotifications(true); resetToast() }}
						/>
					</div>
				</>,
				type: 'primaryColor'
			});
		}
	}, [hasNewNotifications]);

	return (
		<>
			{/* Toast message */}
			<MyToast show={showToast} message={toastMessage} type={toastType} selfClose={toastSelfClose} onClose={() => resetToast()} />

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
						<img src="/logo.png" alt="logo" className="rounded-circle logo"></img>
					</div>
					<small className='fs-70 text-gray-400'>
						INGOBOKA
					</small>
					<div className="d-flex gap-2 d-md-none ms-auto me-2 text-light" style={{ '--_activeColor': 'var(--bs-gray-500)' }}>
						<button className={`nav-link px-2 ${hasNewNotifications ? 'active-with-dot' : ''} text-gray-400 rounded-0 clickDown`} title='Notifications'
							onClick={() => setShowNotifications(true)}
						>
							<BellSimple weight={hasNewNotifications ? 'fill' : undefined} size={20}
								style={{ animation: hasNewNotifications ? 'shakeX 10s infinite' : 'unset' }}
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
							<button className={`nav-link px-2 ${hasNewNotifications ? 'bg-gray-300 text-primaryColor active-with-dot' : 'text-gray-600'} rounded-pill clickDown`} title='Notifications'
								onClick={() => setShowNotifications(true)}
							>
								<BellSimple weight={hasNewNotifications ? 'fill' : undefined} size={20}
									style={{ animation: hasNewNotifications ? 'shakeX 10s infinite' : 'unset' }}
								/>
							</button>
						</div>
					</div>
					<div className="d-flex align-items-center me-3 border-light border-opacity-25">
						<div className='ms-auto d-grid pb-1'>
							<span className='ms-auto smaller'>{accountantNames}</span>
							<span className='ms-auto fs-70 opacity-75' style={{ lineHeight: 1 }}>Accountant</span>
						</div>
						<Menu menuButton={
							<MenuButton className="border-0 p-0">
								<img src={accountantAvatar} alt="" className='w-2_5rem ratio-1-1 object-fit-cover ms-2 d-none d-md-block border border-3 border-light bg-light rounded-circle ptr' />
							</MenuButton>
						} transition>
							<MenuItem onClick={() => { setActiveSection('settings') }}>
								<Gear weight='fill' className="me-2 opacity-50" /> Settings
							</MenuItem>
							<MenuDivider />
							<MenuItem onClick={() => { fncPlaceholder() }}>
								<SignOut weight='fill' className="me-2 opacity-50" /> Sign out
							</MenuItem>
						</Menu>
					</div>
				</div>
			</header>

			<main className="container-fluid">
				{/* Notifications */}
				{showNotifications && (
					<div className='position-fixed fixed-top inset-0 bg-black2 px-2 pt-5 pb-3 inx-max'>
						<div className="position-relative h-100 col-sm-7 col-md-5 col-lg-4 col-xxl-3 mx-auto me-md-0 bg-light border-secondary border-opacity-25 rounded-4 notifications-card" style={{ animation: 'flyInTop .3s 1' }}>
							{/* Icon */}
							<div className="position-absolute start-50 w-fit h-fit px-3 py-1 blur-bg-3px border border-light border-opacity-50 rounded-pill" style={{ translate: "-50% -120%", animation: 'flyInBottom .5s 1' }}>
								<BellSimple weight="fill" size={20} className='text-light' /> <span className='smaller text-gray-200'>Notifications</span>
							</div>
							<AbsoluteCloseButton text="primaryColor" onClose={() => setShowNotifications(false)} />
							{/* Content */}
							<div className="h-100 p-3 overflow-auto">
								{allCredits.filter(cr => cr.status === 'pending').length === 0 ? (
									<EmptyBox
										notFoundMessage="All clear. Any new notifications will show up here."
										fluid
										className="mt-5"
									/>
								) : (
									<>
										{allCredits
											.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate))
											.filter(cr => cr.status === 'pending')
											.map((cr, index) => {
												const associatedMember = allMembers.find(m => m.id === cr.memberId);
												const names = `${associatedMember.husbandFirstName} ${associatedMember.husbandLastName}`;

												return (
													<div key={index} className="d-flex mb-2 py-2 border-bottom">
														<img src={associatedMember.husbandAvatar ? associatedMember.husbandAvatar : '/images/man_avatar_image.jpg'} alt="" className='w-2rem h-2rem flex-grow-0 flex-shrink-0 me-2 object-fit-cover bg-light rounded-circle' />
														<div className="">
															<div className="d-flex align-items-center justify-content-between mb-1 pb-1 border-bottom text-primaryColor small">
																<span>Loan request</span>
																<small className='text-gray-600'>
																	{formatDate(cr.updatedAt, { todayKeyword: true })}
																</small>
															</div>
															<p className='mb-1 fs-75 text-gray-600'>
																{names} is requesting a loan of <CurrencyText amount={Number(cr.creditAmount)} />
															</p>
															<button className='btn btn-sm pe-1 fs-60 rounded-pill bg-primaryColor text-light clickDown' style={{ paddingBlock: '.125rem' }}
																onClick={() => { setActiveSection('credits'); setShowNotifications(false); }}
															>Respond <CaretRight /></button>
														</div>
													</div>
												)
											})
										}
									</>
								)}
							</div>
						</div>
					</div>
				)}

				<div className="row">
					{/* Sidebar Navigation */}
					<nav className={`col-12 col-md-3 col-xl-2 px-2 px-sm-5 px-md-0 d-md-block border-end overflow-y-auto sidebar ${sideNavbarIsFloated ? 'floated' : ''}`} id="sidebarMenu">
						<div ref={sideNavbarRef} className={`position-sticky top-0 h-fit my-2 my-md-0 py-3 col-8 col-sm-5 col-md-12 ${sideNavbarIsFloated ? 'rounded-4' : ''}`}>
							<div className="d-flex align-items-center d-md-none mb-3 px-3 pb-2 border-light border-opacity-25">
								<div className='ms-auto d-grid pb-1'>
									<span className='ms-auto smaller'>{accountantNames}</span>
									<span className='ms-auto fs-70 opacity-75' style={{ lineHeight: 1 }}>Accountant</span>
								</div>
								<img src={accountantAvatar} alt="" className='w-2_5rem ratio-1-1 object-fit-cover ms-2 border border-3 border-secondary bg-gray-600 rounded-circle' />
							</div>

							<ul className="nav flex-column">
								<li className={`nav-item mx-4 mx-sm-5 mx-md-0 mb-2 ${activeSection === 'dashboard' ? 'active' : ''}`}
									onClick={() => { setActiveSection("dashboard"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<ChartPieSlice size={20} weight='fill' className="me-2" /> Dashboard
									</button>
								</li>
								<li className={`nav-item mx-4 mx-sm-5 mx-md-0 mb-2 ${activeSection === 'members' ? 'active' : ''}`}
									onClick={() => { setActiveSection("members"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<Users size={20} weight='fill' className="me-2" /> Members
									</button>
								</li>
								<li className={`nav-item mx-4 mx-sm-5 mx-md-0 mb-2 ${activeSection === 'savings' ? 'active' : ''}`}
									onClick={() => { setActiveSection("savings"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<Coin size={20} weight='fill' className="me-2" /> Savings
									</button>
								</li>
								<li className={`nav-item mx-4 mx-sm-5 mx-md-0 mb-2 ${activeSection === 'interest' ? 'active' : ''}`}
									onClick={() => { setActiveSection("interest"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<Coins size={20} weight='fill' className="me-2" /> Interest
									</button>
								</li>
								<li className={`nav-item mx-4 mx-sm-5 mx-md-0 mb-2 ${activeSection === 'credits' ? 'active' : ''}`}
									onClick={() => { setActiveSection("credits"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<Blueprint size={20} weight='fill' className="me-2" /> Credits
									</button>
									{hasNewNotifications && (
										<span
											className='r-middle-m h-1rem flex-center me-3 px-2 bg-gray-300 text-gray-900 fs-60 fw-medium rounded-pill'
											style={{ lineHeight: 1 }}>
											{allCredits.filter(cr => cr.status === 'pending').length}
										</span>
									)}
								</li>
								<li className={`nav-item mx-4 mx-sm-5 mx-md-0 mb-2 ${activeSection === 'transactions' ? 'active' : ''}`}
									onClick={() => { setActiveSection("transactions"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<CashRegister size={20} weight='fill' className="me-2" /> Transactions
									</button>
								</li>
								<li className={`nav-item mx-4 mx-sm-5 mx-md-0 ${activeSection === 'reports' ? 'active' : ''}`}
									onClick={() => { setActiveSection("reports"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<Files size={20} weight='fill' className="me-2" /> Reports
									</button>
								</li>
								{/* <li className={`nav-item mx-4 mx-sm-5 mx-md-0 mb-2 ${activeSection === 'messages' ? 'active' : ''}`}
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

								<li className={`nav-item mx-4 mx-sm-5 mx-md-0 mb-2 ${activeSection === 'auditLogs' ? 'active' : ''}`}
									onClick={() => { setActiveSection("auditLogs"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<Notebook size={20} weight='fill' className="me-2" /> Audit Logs
									</button>
								</li>

								<li className={`nav-item mx-4 mx-sm-5 mx-md-0 mb-2 ${activeSection === 'settings' ? 'active' : ''}`}
									onClick={() => { setActiveSection("settings"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<Gear size={20} weight='fill' className="me-2" /> Settings
									</button>
								</li>

								<li className={`nav-item mx-4 mx-sm-5 mx-md-0 mb-3 d-md-none`}>
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
