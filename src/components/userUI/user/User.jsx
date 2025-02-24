import React, { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Container, Form } from "react-bootstrap";
import './user.css';
import MyToast from '../../common/Toast';
import { ArrowClockwise, ArrowsClockwise, ArrowsHorizontal, ArrowsVertical, BellSimple, Blueprint, Calendar, CaretDown, CaretRight, CashRegister, ChartBar, ChartPie, ChartPieSlice, Check, Coin, Coins, CurrencyDollarSimple, EnvelopeSimple, Files, FloppyDisk, Gavel, Gear, List, Pen, Phone, Plus, Receipt, SignOut, User, UserRectangle, Users, Wallet, WarningCircle, Watch, X } from '@phosphor-icons/react';
import { expensesTypes } from '../../../data/data';
import ExportDomAsFile from '../../common/exportDomAsFile/ExportDomAsFile';
import DateLocaleFormat from '../../common/dateLocaleFormats/DateLocaleFormat';
import CurrencyText from '../../common/CurrencyText';
import LoadingIndicator from '../../LoadingIndicator';
import { cError, fncPlaceholder, getDateHoursMinutes, normalizedLowercaseString, printDatesInterval, maxInputNumber } from '../../../scripts/myScripts';
import FormatedDate from '../../common/FormatedDate';
import FetchError from '../../common/FetchError';
import useCustomDialogs from '../../common/hooks/useCustomDialogs';
import ActionPrompt from '../../common/actionPrompt/ActionPrompt';
import ConfirmDialog from '../../common/confirmDialog/ConfirmDialog';
import NotFound from '../../common/NotFound';
import JsonJsFormatter from '../../common/JsonJsFormatter';
import { useParams } from 'react-router';
import { Menu, MenuButton, MenuDivider, MenuItem } from '@szhsin/react-menu';
import CountUp from 'react-countup';
import BarGraph from '../../chartJS/BarGraph';
import EmptyBox from '../../common/EmptyBox';
import ContentToggler from '../../common/ContentToggler';
import DividerText from '../../common/DividerText';
import { BASE_URL, Axios } from '../../../api/api';
import { AuthContext } from '../../AuthProvider';
import RightFixedCard from '../../common/rightFixedCard/RightFixedCard';
import Popover from '@idui/react-popover';
import SmallLoader from '../../common/SmallLoader';
import NextStepInformer from '../../common/NextStepInformer';
import SystemSettings from '../../systemSettings/SystemSettings';

const UserUI = () => {

	// Get user data
	const { userId } = useParams();
	const [signedUser, setSignedUser] = useState({});

	const signedUserNames = useMemo(() => (
		`${signedUser?.husbandFirstName} ${signedUser?.husbandLastName}`
	), [signedUser]);

	const signedUserType = useMemo(() => (
		signedUser?.type
	), [signedUser]);

	// Custom hooks
	const {
		// Toast
		showToast,
		toastMessage,
		toastType,
		toastSelfClose,
		toastSelfCloseTimeout,
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

	const { logout } = useContext(AuthContext);

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

	/**
	 * Settings
	 */

	const [allSettings, setAllSettings] = useState([]);
	const [loadingSettings, setLoadingSettings] = useState(false);
	const [errorLoadingSettings, setErrorLoadingSettings] = useState(false);

	// Fetch settings
	const fetchSettings = async () => {
		try {
			setLoadingSettings(true);
			const response = await Axios.get(`/api/settings/system/all`);
			const data = response.data;
			setAllSettings(data);
			setErrorLoadingSettings(null);
		} catch (error) {
			const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to load settings. Please try again.";
			warningToast({ message: errorMessage });
			console.error("Error fetching settings:", error);
		} finally {
			setLoadingSettings(false);
		}
	};

	useEffect(() => {
		fetchSettings();
	}, []);

	// Extract settings data

	const [retrievedData, setRetrievedData] = useState({});

	useEffect(() => {
		if (allSettings.settingsData) {
			setRetrievedData(JSON.parse(allSettings?.settingsData));
		}
	}, [allSettings]);

	const sysSettings = useMemo(() => (
		retrievedData?.system
	), [retrievedData])

	const membersSettings = useMemo(() => (
		retrievedData?.members
	), [retrievedData])

	const savingsSettings = useMemo(() => (
		retrievedData?.savings
	), [retrievedData])

	const expensesSettings = useMemo(() => (
		retrievedData?.expenses
	), [retrievedData])

	const creditsSettings = useMemo(() => (
		retrievedData?.credits
	), [retrievedData])

	// Members settings

	const memberRoles = useMemo(() => membersSettings?.roles || [], [membersSettings]);

	const [roleSettings, setRoleSettings] = useState(memberRoles || []);

	// Credits settings

	const creditPrimaryInterest = useMemo(() => {
		return Number(creditsSettings?.interests
			.find(t => t.type === 'primary')?.rate)
	}, [creditsSettings]);

	const creditSecondaryInterest = useMemo(() => {
		return Number(creditsSettings?.interests
			.find(t => t.type === 'secondary')?.rate)
	}, [creditsSettings]);

	const creditPrimaryInterestPercentage = useMemo(() => {
		return creditPrimaryInterest / 100
	}, [creditPrimaryInterest]);

	const creditSecondaryInterestPercentage = useMemo(() => {
		return creditSecondaryInterest / 100
	}, [creditSecondaryInterest]);

	const [creditSettings, setCreditSettings] = useState({
		interestPrimary: creditPrimaryInterest,
		interestSecondary: creditSecondaryInterest,
		penalty: 2,
	});

	// Savings settings

	const monthlySavingsDay = useMemo(() => {
		return savingsSettings?.monthlyDueDay
	}, [savingsSettings]);

	const unitShareValue = useMemo(() => {
		return savingsSettings?.types
			.find(t => t.type === 'cotisation')?.amount
	}, [savingsSettings]);

	const cotisationPenalty = useMemo(() => {
		return savingsSettings?.types
			.find(t => t.type === 'cotisation')?.delayPenaltyAmount
	}, [savingsSettings]);

	const [shareSettings, setShareSettings] = useState({
		valuePerShare: unitShareValue,
	});

	const [savingSettings, setSavingSettings] = useState({
		cotisation: true,
		social: true,
		dueDate: savingsSettings?.monthlyDueDay,
		delayPenalty: cotisationPenalty,
	});

	// Records settings

	const expenseTypes = useMemo(() => expensesSettings?.types || [], [expensesSettings]);

	/**
	 * Members
	 */

	const [allMembers, setAllMembers] = useState([]);
	const [membersToShow, setMembersToShow] = useState([]);
	const [loadingMembers, setLoadingMembers] = useState(false);
	const [errorLoadingMembers, setErrorLoadingMembers] = useState(false);

	const totalCotisation = allMembers.reduce((sum, m) => (sum + (m.shares * unitShareValue)), 0);
	const totalSocial = allMembers.reduce((sum, m) => sum + Number(m.social), 0);

	const accountantNames = useMemo(() => {
		const member = allMembers.find(m => (m.role === 'accountant'));
		return `${member?.husbandLastName} ${member?.husbandFirstName}`;
	}, [allMembers]);

	// Fetch members
	const fetchMembers = async () => {
		try {
			setLoadingMembers(true);
			const response = await Axios.get(`/users`);
			const data = response.data;
			setAllMembers(data);
			setMembersToShow(data);
			setSignedUser(data.find(m => m.id === Number(userId)));
			setErrorLoadingMembers(null);
		} catch (error) {
			const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to load members. Please try again.";
			setErrorWithFetchAction(errorMessage);
			setErrorLoadingMembers(errorMessage);
			warningToast({ message: errorMessage });
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
			const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to load figures. Please try again.";
			setErrorWithFetchAction(errorMessage);
			setErrorLoadingFigures(errorMessage);
			warningToast({ message: errorMessage });
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
			const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to load credits. Please try again.";
			setErrorWithFetchAction(errorMessage);
			setErrorLoadingCredits(errorMessage);
			warningToast({ message: errorMessage });
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
			const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to load loans. Please try again.";
			setErrorWithFetchAction(errorMessage);
			setErrorLoadingLoans(errorMessage);
			warningToast({ message: errorMessage });
			console.error("Error fetching loans:", error);
		} finally {
			setLoadingLoans(false);
		}
	};

	useEffect(() => {
		fetchLoans();
	}, []);

	const totalPaidInterest = allLoans.reduce((sum, loan) => sum + Number(loan.interestPaid), 0);

	const currentPeriodPaidInterest = totalPaidInterest
		- allMembers.reduce((sum, m) => sum + Number(m.distributedInterestPaid), 0);

	const interestToReceive =
		currentPeriodPaidInterest
		+ allMembers.reduce((sum, m) => sum + Number(m.initialInterest), 0);

	const pendingInterest = useMemo(() => (
		allLoans.reduce((sum, loan) => sum + loan.interestPending, 0)
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
			const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to load records. Please try again.";
			setErrorWithFetchAction(errorMessage);
			setErrorLoadingRecords(errorMessage);
			warningToast({ message: errorMessage });
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

	/**
	 * Data refresh
	 */

	const refreshAllData = async () => {
		try {
			setIsWaitingFetchAction(true);
			await Promise.all([
				fetchMembers(),
				fetchFigures(),
				fetchCredits(),
				fetchLoans(),
				fetchRecords()
			]);

			messageToast({ message: 'Data refreshed', type: 'primaryColor', selfCloseTimeout: 2000 });
		} catch (error) {
			warningToast({ message: 'Failed to refresh some data. You can try again' });
			console.error('Error refreshing data:', error);
		} finally {
			setIsWaitingFetchAction(false);
		}
	};

	// Active UI section
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

		const accountingDashboardRef = useRef();

		const totalLoanDisbursed = allFigures?.loanDisbursed
		const totalPaidCapital = allFigures?.paidCapital
		const totalPenalties = allFigures?.penalties
		const totalBalance = allFigures?.balance

		const dashboardDT = [
			{ label: 'Cotisation', value: totalCotisation, },
			{ label: 'Social', value: totalSocial, },
			{ label: 'Loan Delivered', value: totalLoanDisbursed, },
			{ label: 'Paid Interest', value: totalPaidInterest, },
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
					<div className="d-lg-flex align-items-center">
						<img src="/images/dashboard_visual.png" alt="" className='col-md-5' />
						<div className='alert mb-4 rounded-0 smaller fw-light'>
							This numerical report provides a financial status overview for IKIMINA INGOBOKA saving management system. It highlights key metrics, including contributions, social funds, loans disbursed, interest receivables, paid capital, and other financial indicators. The report reflects the financial management system's performance, tracking transactions from stakeholder contributions, savings, investments, and other financial activities, all aligned with the system's saving balance and agreements established among its members.
						</div>
					</div>
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

		// Show info
		const [showMemberInfo, setShowMemberInfo] = useState(false);
		const [showPrimaryMemberInfo, setShowPrimaryMemberInfo] = useState(true);

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
		// 		setErrorWithFetchAction(error.message);
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
				const errorMessage = error.response?.data?.error || error.response?.data?.message || "Couldn't save changes. Tyr again";
				setErrorWithFetchAction(errorMessage);
				warningToast({ message: errorMessage })
				cError('Error saving changes:', error.response?.data || error.message);
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
							<ChartBar /> Statistics
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
					{!loadingMembers && !errorLoadingMembers && !membersToShow.length && (
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
												className="w-5rem ratio-1-1 object-fit-cover p-1 border border-3 border-secondary border-opacity-25 bg-light rounded-circle ptr"
												onClick={() => { setSelectedMember(member); setShowMemberInfo(true); setShowPrimaryMemberInfo(true) }}
											/>
											<img src={member.wifeAvatar ? member.wifeAvatar : '/images/woman_avatar_image.jpg'}
												alt={member.wifeFirstName ? `${member.wifeFirstName.slice(0, 1)}.${member.wifeLastName}` : 'Partner image'}
												className="w-5rem ratio-1-1 object-fit-cover p-1 border border-3 border-secondary border-opacity-25 bg-light rounded-circle ptr"
												onClick={() => {
													if (member?.wifeFirstName === null) {
														messageToast({ message: "No data to show", selfCloseTimeout: 2000 })
													} else {
														setSelectedMember(member); setShowMemberInfo(true); setShowPrimaryMemberInfo(false);
													}
												}}
											/>
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

							{/* Member primary info preview */}
							<RightFixedCard
								show={showMemberInfo}
								onClose={() => setShowMemberInfo(false)}
								title="Personal information"
								icon={<UserRectangle size={20} weight="fill" className='text-gray-700' />}
								content={
									<>
										<div>
											<div className="position-relative w-fit mb-5" style={{ minWidth: '20rem' }}>
												<img src={showPrimaryMemberInfo ? (selectedMember?.husbandAvatar || '/images/man_avatar_image.jpg') : (selectedMember?.wifeAvatar || '/images/woman_avatar_image.jpg')}
													alt="Member avatar"
													className="ratio-1-1 object-fit-cover rounded-3"
													style={{ maxWidth: '20rem', objectPosition: 'center 25%' }}
												/>
												<div className="position-absolute bg-light text-gray-600 py-1 px-3 rounded-2 start-50 top-100 translate-middle text-nowrap smaller shadow-sm">
													{showPrimaryMemberInfo ? `${selectedMember?.husbandFirstName} ${selectedMember?.husbandLastName} ` : `${selectedMember?.wifeFirstName} ${selectedMember?.wifeLastName}`}
												</div>
											</div>
											<div className="d-flex gap-2 mb-3">
												<a href={`tel:+${showPrimaryMemberInfo ? selectedMember.husbandPhone : selectedMember.wifePhone}`} className="btn btn-sm btn-outline-secondary border px-3 border-secondary border-opacity-25 rounded-pill flex-align-center clickDown">
													<Phone className='me-2' /> Call
												</a>
												<a href={`mailto:${showPrimaryMemberInfo ? selectedMember.husbandEmail : selectedMember.wifeEmail}`} className="btn btn-sm btn-outline-secondary border px-3 border-secondary border-opacity-25 rounded-pill flex-align-center clickDown">
													<EnvelopeSimple className='me-2' /> Email
												</a>
											</div>

											{showPrimaryMemberInfo ? (
												<ul className="list-unstyled text-gray-700 px-2 small">
													<li className="py-1">
														<b>Phone:</b> <span>{selectedMember?.husbandPhone}</span>
													</li>
													<li className="py-1">
														<b>Email:</b> <span>{selectedMember?.husbandEmail}</span>
													</li>
												</ul>
											) : (
												<ul className="list-unstyled text-gray-700 px-2 small">
													<li className="py-1">
														<b>Phone:</b> {selectedMember?.wifePhone ? (
															<span>{selectedMember?.wifePhone}</span>
														) : 'Not provided'}
													</li>
													<li className="py-1">
														<b>Email:</b>  {selectedMember?.wifeEmail ? (
															<span>{selectedMember?.wifeEmail}</span>

														) : 'Not provided'}
													</li>
												</ul>
											)}
										</div>
									</>
								}
								fitWidth={true}
							/>
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
						return total + (isCurrentLate ? (unitShareValue + cotisationPenalty) : unitShareValue);
					} else {
						return total + unitShareValue;
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

				const payload = savingRecordType === 'cotisation' ? {
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
					body: JSON.stringify(payload),
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
				fetchFigures();
				fetchRecords();
			} catch (error) {
				setErrorWithFetchAction(error.message);
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
				return toast({
					message: <><WarningCircle size={22} weight='fill' className='me-1 opacity-50' /> Enter valid number of shares to continue</>,
					type: 'gray-700'
				});
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
				setErrorWithFetchAction(error.message);
				cError("Error adding multiple shares:", error);
				warningToast({ message: error.message || "An unknown error occurred" });
			} finally {
				setIsWaitingFetchAction(false);
			}
		};

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
					{!loadingMembers && !errorLoadingMembers && !savingsToShow.length && (
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
																</span>
															</li>
															<li className="py-1 d-table-row">
																<span className='d-table-cell border-start border-secondary ps-2'>Cotisation:</span> <span className='d-table-cell ps-2'>{cotisation.toLocaleString()} RWF</span>
															</li>
															<li className="py-1 d-table-row">
																<span className='d-table-cell border-start border-secondary ps-2'>Social:</span> <span className='d-table-cell ps-2'>{Number(social).toLocaleString()} RWF</span>
															</li>
															<li className="py-1 fs-5 d-table-row">
																<b className='d-table-cell'>Total:</b> <span className='d-table-cell ps-2'>{(cotisation + Number(social)).toLocaleString()} RWF</span>
															</li>
														</ul>
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
									<div className='position-fixed fixed-top inset-0 flex-center py-3 bg-black2 inx-high'>
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
																This applies a fine of <CurrencyText amount={cotisationPenalty} /> for each of the delayed months.
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
																: <>Working <SmallLoader color='gray-500' /></>
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
									<div className='position-fixed fixed-top inset-0 flex-center py-3 bg-white3 inx-high'>
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
												<ul className="list-unstyled text-gray-700 px-2 opacity-75 smaller">
													<li className="py-1 w-100">
														<span className="flex-align-center">
															<b className='fs-5'>{selectedMember?.shares} Shares</b>
														</span>
													</li>
													<li className="py-1 d-table-row">
														<span className='d-table-cell border-start border-secondary ps-2'>Cotisation:</span> <span className='d-table-cell ps-2'><CurrencyText amount={selectedMember?.cotisation} /></span>
													</li>
													<li className="py-1 d-table-row">
														<span className='d-table-cell border-start border-secondary ps-2'>Social:</span> <span className='d-table-cell ps-2'><CurrencyText amount={Number(selectedMember?.social)} /></span>
													</li>
													<li className="py-1 fs-5 d-table-row">
														<b className='d-table-cell'>Total:</b> <span className='d-table-cell ps-2'><CurrencyText amount={selectedMember?.cotisation + Number(selectedMember?.social)} /></span>
													</li>
												</ul>
												<DividerText text="Add new shares" type='gray-300' className="mb-4" />
												{/* The form */}
												<form onSubmit={(e) => e.preventDefault()} className="px-sm-2 pb-5">
													<div className="mb-3">
														<label htmlFor="savingAmount" className="form-label fw-bold" required>
															Number of shares ({multipleSharesAmount !== '' ? `${multipleSharesAmount} Share${multipleSharesAmount > 1 ? 's' : ''}` : ''}) {multipleSharesAmount !== '' && multipleSharesAmount !== 0 && (
																<>
																	= <CurrencyText amount={Number(multipleSharesAmount) * unitShareValue} />
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
														<div className="form-text text-info-emphasis fw-bold">Unit share value is <CurrencyText amount={unitShareValue} /> </div>
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
																: <>Working <SmallLoader color='light' /></>
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
		const totalActiveShares = activeMembers.reduce((sum, item) => {
			const paidAnnualShares = JSON.parse(item.annualShares).filter(share => share.paid).length;
			return sum + item.progressiveShares + paidAnnualShares;
		}, 0);

		let totalSharesPercentage = 0;
		let totalMonetaryInterest = 0;
		let totalInterestReceivable = 0;
		let totalSharesReceivable = 0;
		let totalInterestRemains = 0;
		let totalAnnualShares = 0;

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
		)), [allAnnualInterest]);

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
				setErrorLoadingAnnualInterest("Failed to load loans. Please try again.");
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
				<div className="alert alert-success smaller">
					<p className='display-6'>
						Statut des intérêts annuels
					</p>
					<div className="d-flex flex-wrap gap-2 ms-lg-auto mb-2">
						<div className='col'>
							<div className='flex-align-center text-muted border-bottom'><ChartPie className='me-1 opacity-50' /> <span className="text-nowrap">All shares</span></div>
							<div className='text-center bg-bodi fs-6'>{totalActiveShares}</div>
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
								<th className='py-3 text-nowrap text-gray-700 fw-normal'>Shares <sub className='fs-60'>/Active</sub></th>
								<th className='py-3 text-nowrap text-gray-700 fw-normal'>Share % <sub className='fs-60'>to <b>{totalActiveShares}</b></sub></th>
								<th className='py-3 text-nowrap text-gray-700 fw-normal'>Interest <sub className='fs-60'>/RWF</sub></th>
								<th className='py-3 text-nowrap text-gray-700 fw-normal'>Receivable<sub className='fs-60'>/RWF</sub></th>
								<th className='py-3 text-nowrap text-gray-700 fw-normal'>Receivable<sub className='fs-60'>/Shares</sub></th>
								<th className='py-3 text-nowrap text-gray-700 fw-normal'>Remains<sub className='fs-60'>/RWF</sub></th>
							</tr>
						</thead>
						<tbody>
							{activeMembers.map((member, index) => {
								const memberNames = `${member.husbandFirstName} ${member.husbandLastName}`;
								const progressiveShares = member.progressiveShares;
								const paidAnnualShares = JSON.parse(member.annualShares).filter(share => share.paid).length;
								const activeShares = progressiveShares + paidAnnualShares;
								const sharesProportion = totalActiveShares > 0 ? activeShares / totalActiveShares : 0;
								const sharesPercentage = (sharesProportion * 100).toFixed(3);
								const activeinterest = currentPeriodPaidInterest * sharesProportion;
								const interest = activeinterest + Number(member.initialInterest);
								const interestReceivable = (Math.floor(interest / unitShareValue) * unitShareValue);
								const sharesReceivable = interestReceivable / unitShareValue;
								const interestRemains = interest - interestReceivable;

								totalSharesPercentage += Number(sharesPercentage);
								totalMonetaryInterest += Number(interest);
								totalInterestReceivable += interestReceivable;
								totalSharesReceivable += sharesReceivable;
								totalInterestRemains += interestRemains;

								return (
									<tr key={index} className="small cursor-default clickDown interest-row">
										<td className="border-bottom-3 border-end">{index + 1}</td>
										<td className='text-nowrap'>{memberNames}</td>
										<td>{activeShares}</td>
										<td className="text-nowrap">{sharesPercentage} %</td>
										<td className="text-nowrap text-gray-700">
											<CurrencyText amount={interest} smallCurrency />
										</td>
										<td className="text-nowrap text-success">
											<CurrencyText amount={interestReceivable} smallCurrency />
										</td>
										<td className="text-success">
											{sharesReceivable}
										</td>
										<td className="text-nowrap text-gray-700">
											<CurrencyText amount={interestRemains} smallCurrency />
										</td>
									</tr>
								);
							})}
							<tr className="small cursor-default fs-5 table-success clickDown interest-row">
								<td className="border-bottom-3 border-end" title='Total'>T</td>
								<td className='text-nowrap'>{totalMembers} <span className="fs-60">members</span></td>
								<td className='text-nowrap'>{totalActiveShares}</td>
								<td className="text-nowrap">{totalSharesPercentage.toFixed(3)} %</td>
								<td className="text-nowrap fw-semibold">
									<CurrencyText amount={totalMonetaryInterest} smallCurrency />
								</td>
								<td className="text-nowrap fw-semibold text-success">
									<CurrencyText amount={totalInterestReceivable} smallCurrency />
								</td>
								<td className="text-nowrap fw-semibold text-success">
									{totalSharesReceivable} <span className='fs-70 fw-normal'>shares</span>
								</td>
								<td className="text-nowrap">
									<CurrencyText amount={totalInterestRemains} smallCurrency />
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		)
	}

	// Credit
	const Credit = () => {
		const [activeLoanSection, setActiveLoanSection] = useState(
			allCredits.filter(cr => (cr?.memberId === signedUser?.id && cr.status === 'pending')).length
				? 'pending'
				: 'approved'
		);
		const [activeLoanSectionColor, setActiveLoanSectionColor] = useState('#a3d5bb75');

		// Filtering credits
		const [membersToShow, setMembersToShow] = useState(allMembers || []);
		const [memberSearchValue, setMemberSearchValue] = useState('');

		// // Search members
		// const memberSearcherRef = useRef();

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
				const id = selectedCredit?.memberId;
				setAssociatedMember(allMembers.filter(m => m.id === id));
			}
		}, [selectedCredit,]);

		/**
		 * Apply loan penalties
		 */

		const [showRequestCreditForm, setShowRequestCreditForm] = useState(false);
		const [creditAmount, setCreditAmount] = useState('');
		const [requestDate, setRequestDate] = useState('');
		const [dueDate, setDueDate] = useState('');
		const [tranches, setTranches] = useState(1);
		const [comment, setComment] = useState('');
		const [trancheDates, setTrancheDates] = useState([]);
		const [trancheAmounts, setTrancheAmounts] = useState([]);
		const totaltrancheAmounts = useMemo(() => (
			trancheAmounts.reduce((sum, val) => sum + Number(val), 0)
		), [trancheAmounts])
		const totalPaymentAmount = useMemo(() => (
			creditAmount * (1 + creditPrimaryInterestPercentage)
		), [creditAmount])


		const calculateDefaultTrancheAmounts = (credit, numTranches) => {
			const totalAmountWithInterest = Number(credit) * (1 + creditPrimaryInterestPercentage);
			// console.log('totalAmountWithInterest: ', totalAmountWithInterest);
			return Array.from({ length: numTranches }, () => totalAmountWithInterest / numTranches);
		};

		useEffect(() => {
			const defaultTrancheAmounts = calculateDefaultTrancheAmounts(creditAmount, tranches);
			setTrancheAmounts(defaultTrancheAmounts);
		}, [creditAmount, tranches]);

		// Handle tranche due date input changes
		const handleTrancheDateChange = (index, value) => {
			const updatedDates = [...trancheDates];
			updatedDates[index] = value;
			setTrancheDates(updatedDates);
		};

		// Handle tranche amount input changes
		const handleTrancheAmountChange = (index, value) => {
			const updatedAmounts = [...trancheAmounts];
			updatedAmounts[index] = value;
			setTrancheAmounts(updatedAmounts);
		};

		// Generate tranche due date inputs based on the selected number of tranches
		const renderTrancheInputs = () => {
			return Array.from({ length: tranches }).map((_, index) => (
				<div key={index} className="mb-3">
					<div className="form-label fw-bold">
						Tranche {index + 1}
					</div>
					<div className="d-sm-flex gap-2">
						<div className="col">
							<label className="form-label">
								Due Date {!['', 0, undefined].includes(trancheDates[index]) && (<FormatedDate date={trancheDates[index]} className="ms-1 fw-semibold fst-italic" />)}
							</label>
							<input
								type="date"
								className="form-control"
								value={trancheDates[index] || ''}
								onChange={(e) => handleTrancheDateChange(index, e.target.value)}
								required
							/>
						</div>
						<div className="col">
							<label className="form-label">
								Tranche amount {!['', 0, undefined].includes(trancheAmounts[index]) && (<CurrencyText amount={Number(trancheAmounts[index])} className="ms-1 fw-semibold fst-italic" />)}
							</label>
							<input
								type="number"
								placeholder="Enter amount"
								className="form-control"
								value={trancheAmounts[index] || ''}
								onChange={(e) => handleTrancheAmountChange(index, e.target.value)}
								required
							/>
						</div>
					</div>
				</div>
			));
		};

		// Construct the creditPayment array before submitting
		const constructCreditPayment = () => {
			return trancheDates.map((date, index) => ({
				tranchNumber: index + 1,
				tranchDueDate: date,
				tranchAmount: trancheAmounts[index],
				paid: false,
				slipUrl: null,
				finesCount: 0,
			}));
		};

		// Handle form submission
		const handleRequestCredit = async (e) => {
			e.preventDefault();
			try {
				const creditPayment = constructCreditPayment();
				const payload = {
					memberId: signedUser?.id,
					creditAmount,
					requestDate,
					dueDate,
					tranches,
					comment,
					creditPayment, // Pass the generated tranche payment data
				};

				setIsWaitingFetchAction(true);
				const response = await Axios.post(`/credit/create`, payload);
				const data = response.data;
				setShowRequestCreditForm(false);
				fetchCredits();
				successToast({ message: `Success: ${data.message}`, selfClose: false });
			} catch (error) {
				const errorMessage = error.response?.data?.error || error.response?.data?.message || "An unknown error occurred";
				warningToast({ message: errorMessage });
				console.error('Error requesting credit:', error.response?.data || error.message);
			} finally {
				setIsWaitingFetchAction(false);
			}
		};

		return (
			<div className="pt-2 pt-md-0 pb-3">
				<div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
					<h2 className='text-appColor'><Blueprint weight='fill' className="me-1 opacity-50" /> Credit panel</h2>
					<div className="ms-auto d-flex gap-1">
						<button className='btn btn-sm flex-center gap-1 text-primaryColor fw-semibold border-secondary border border-opacity-25 clickDown'
							onClick={() => setShowRequestCreditForm(true)}>
							<Plus /> Request credit
						</button>
					</div>
				</div>

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
									.filter(m => m.id === signedUser?.id)
									.map((member, index) => (
										<Popover key={index} content="See summary" placement='right' isOpen={true} className='py-1 px-2 smaller shadow-none border border-secondary border-opacity-25' arrowColor='var(--bs-gray-400)' height='1.9rem'>
											<div className='w-4rem ms-3 mx-xl-4 ptr clickDown'
												onClick={() => { setSelectedMember(member); setShowSelectedMemberCredits(true) }}
											>
												<img src={member.husbandAvatar ? member.husbandAvatar : '/images/man_avatar_image.jpg'} alt=""
													className="w-100 ratio-1-1 object-fit-cover p-1 bg-light rounded-circle"
												/>
												<div className="mt-1 fs-70 text-center text-primaryColor fw-semibold">
													My credits
												</div>
											</div>
										</Popover>
									))}
							</div>
						</div>

						{/* Member Credits */}
						{showSelectedMemberCredits &&
							<>
								<div className='position-fixed fixed-top inset-0 bg-white3 inx-high'>
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
											{allLoans.filter(loan => (loan?.memberId === selectedMember?.id && loan?.loanTaken > 0)).length > 0 ? (
												<>
													{allLoans.filter(loan => (loan?.memberId === selectedMember?.id && loan?.loanTaken > 0))
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

																			{allCredits.filter(cr => cr?.memberId === selectedMember?.id).length > 0 && (
																				<>
																					<div className="d-flex">
																						<div className='col p-2'>
																							<div className='flex-align-center text-muted border-bottom smaller'><Calendar className='me-1 opacity-50' /> <span className="text-nowrap">First loan</span></div>
																							<div className='text-center bg-gray-300'>
																								<FormatedDate date={allCredits
																									.sort((a, b) => new Date(a.requestDate) - new Date(b.requestDate))
																									.filter(cr => cr?.memberId === selectedMember?.id)[0].requestDate
																								} />
																							</div>
																						</div>
																						<div className='col p-2'>
																							<div className='flex-align-center text-muted border-bottom smaller'><Calendar className='me-1 opacity-50' /> <span className="text-nowrap">Recent loan</span></div>
																							<div className='text-center bg-gray-300'>
																								<FormatedDate date={allCredits
																									.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate))
																									.filter(cr => cr?.memberId === selectedMember?.id)[0].requestDate
																								} />
																							</div>
																						</div>
																					</div>
																				</>
																			)}
																		</div>
																	</div>
																	<hr className='mt-0 mb-4' />

																	{/* Toggle Credit Records */}
																	<ContentToggler
																		state={showSelectedMemberCreditRecords}
																		setState={setShowSelectedMemberCreditRecords}
																		text={<>My credit records</>}
																		className="ms-auto"
																	/>

																	{showSelectedMemberCreditRecords && (
																		<>
																			<div className='overflow-auto'>
																				<table className="table table-hover h-100">
																					<thead className='table-success position-sticky top-0 inx-1 text-uppercase small'>
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
																						{allCredits.filter(cr => (cr?.memberId === selectedMember?.id && cr.status === 'approved'))
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
																										<td className="d-flex flex-column gap-2 text-muted" >
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
																											<div className='d-flex flex-column gap-1 smaller'>
																												<span>
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
																										<td className='text-nowrap'>
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
														notFoundMessage={`No credit records found on your account. Once recorded, the summary of your credits will appear here.`}
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
									<p className='mb-0 fs-75'>( {creditsToShow.filter(cr => (cr.status === 'pending' && cr.memberId === signedUser?.id)).length} )</p>
								</div>
								<div className={`col d-flex flex-column flex-sm-row column-gap-2 p-2 border-top border-bottom border-2 border-success border-opacity-25 tab-selector ${activeLoanSection === 'approved' ? 'active' : ''} user-select-none ptr clickDown`}
									style={{ '--_activeColor': '#a3d5bb' }}
									onClick={() => { setActiveLoanSection('approved'); setActiveLoanSectionColor('#a3d5bb75') }}
								>
									<h5 className='mb-0 small'>Approved</h5>
									<p className='mb-0 fs-75'>( {creditsToShow.filter(cr => (cr.status === 'approved' && cr.memberId === signedUser?.id)).length} )</p>
								</div>
								<div className={`col d-flex flex-column flex-sm-row column-gap-2 p-2 border-top border-bottom border-2 border-danger border-opacity-25 tab-selector ${activeLoanSection === 'rejected' ? 'active' : ''} user-select-none ptr clickDown`}
									style={{ '--_activeColor': '#ebc1c5' }}
									onClick={() => { setActiveLoanSection('rejected'); setActiveLoanSectionColor('#ebc1c575') }}
								>
									<h5 className='mb-0 small'>Rejected</h5>
									<p className='mb-0 fs-75'>( {creditsToShow.filter(cr => (cr.status === 'rejected' && cr.memberId === signedUser?.id)).length} )</p>
								</div>
							</div>

							{/* Selected content */}
							<div style={{ minHeight: '60vh' }}>
								{activeLoanSection === 'pending' && (
									<>
										{creditsToShow.filter(cr => (cr.status === 'pending' && cr.memberId === signedUser?.id)).length > 0 && (
											<div className='overflow-auto'>
												<table className="table table-hover h-100">
													<thead className='table-warning position-sticky top-0 inx-1 text-uppercase small'>
														<tr>
															<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ minWidth: '10rem' }}>Member</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Amount  <sub className='fs-60'>/RWF</sub></th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Date & Interval</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ maxWidth: '13rem' }} >Comment</th>
														</tr>
													</thead>
													<tbody>
														{creditsToShow
															.filter(cr => (cr.status === 'pending' && cr.memberId === signedUser?.id))
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
																		<td className="d-flex flex-column gap-2 text-muted" >
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
																			<div className='d-flex flex-column gap-1 smaller'>
																				<span>
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
																	</tr>
																)
															})
														}
													</tbody>
												</table>
											</div>
										)}
										{/* Zero content - no credits */}
										{!creditsToShow.filter(cr => (cr.status === 'pending' && cr.memberId === signedUser?.id)).length > 0 && (
											<NotFound
												notFoundMessage="No pending credits found"
												icon={<Receipt size={80} className="text-center w-100 mb-3 opacity-50" />}
												refreshFunction={fetchCredits}
											/>
										)}
									</>
								)}

								{activeLoanSection === 'approved' && (
									<>
										{creditsToShow.filter(cr => (cr.status === 'approved' && cr.memberId === signedUser?.id)).length > 0 ? (
											<div className='overflow-auto'>
												<table className="table table-hover h-100">
													<thead className='table-success position-sticky top-0 inx-1 text-uppercase small'>
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
															.filter(cr => (cr.status === 'approved' && cr.memberId === signedUser?.id))
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
																		<td className="d-flex flex-column gap-2 text-muted" >
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
																			<div className='d-flex flex-column gap-1 smaller'>
																				<span>
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
																		<td className='text-nowrap'>
																			Transfered
																		</td>
																	</tr>
																)
															})
														}
													</tbody>
												</table>
											</div>
										) : (
											<NotFound
												notFoundMessage="No approved credits found"
												icon={<Receipt size={80} className="text-center w-100 mb-3 opacity-50" />}
												refreshFunction={fetchCredits}
											/>
										)}
									</>

								)}

								{activeLoanSection === 'rejected' && (
									<>
										{creditsToShow.filter(cr => (cr.status === 'rejected' && cr.memberId === signedUser?.id)).length > 0 && (
											<div className='overflow-auto'>
												<table className="table table-hover h-100">
													<thead className='table-danger position-sticky top-0 inx-1 text-uppercase small'>
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
															.filter(cr => (cr.status === 'rejected' && cr.memberId === signedUser?.id))
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
																		<td className="d-flex flex-column gap-2 text-muted" >
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
																			<div className='d-flex flex-column gap-1 smaller'>
																				<span>
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
																		<td className='text-nowrap'>
																			<button className='btn btn-sm btn-outline-secondary rounded-0'
																				onClick={
																					() => {
																						// customConfirmDialog({
																						// 	message: (
																						// 		<>
																						// 			<h5 className='h6 border-bottom mb-3 pb-2'><Receipt size={25} weight='fill' className='opacity-50' /> Restore Credit Request</h5>
																						// 			<p>
																						// 				A credit request of <CurrencyText amount={Number(credit.creditAmount)} /> submitted by {memberNames} will be restored and marked as pending for further actions.
																						// 			</p>
																						// 		</>
																						// 	),
																						// 	type: 'gray-700',
																						// 	action: () => restoreCreditRequest(credit.id),
																						// 	actionText: 'Restore',
																						// });
																						fncPlaceholder()
																					}
																				}
																			>
																				<Pen /> Edit and request
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
										{!creditsToShow.filter(cr => (cr.status === 'rejected' && cr.memberId === signedUser?.id)).length > 0 && (
											<NotFound
												notFoundMessage="No rejected credits found"
												icon={<Receipt size={80} className="text-center w-100 mb-3 opacity-50" />}
												refreshFunction={fetchCredits}
											/>
										)}
									</>
								)}

								{showBackfillPlanCard && (
									<>
										<div className='position-fixed fixed-top inset-0 bg-white3 inx-high'>
											<div className="container h-100 offset-md-3 col-md-9 offset-xl-2 col-xl-10 px-0 overflow-auto" style={{ animation: "zoomInBack .2s 1", maxHeight: '100%' }}>
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
																						.filter(cr => cr?.memberId === associatedMember[0].id)
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
																	<div className='flex-align-center smaller'><Calendar className='me-1 opacity-50' /> <span className="text-nowrap">Payment due date</span></div>
																	<div className='text-center bg-gray-300'><FormatedDate date={selectedCredit.dueDate} /></div>
																</div>
															</div>
														</div>
														<ul className="list-unstyled d-flex flex-wrap gap-3 px-1 px-sm-2 px-lg-3 small">
															<li className='border-start border-dark border-opacity-50 ps-2'>
																<b>Amount requested</b>: <CurrencyText amount={Number(selectedCredit.creditAmount)} />
															</li>
															<li className='border-start border-dark border-opacity-50 ps-2'>
																<b>Interest</b>: <CurrencyText amount={
																	JSON.parse(selectedCredit.creditPayment).reduce((sum, tr) => sum + Number(tr.tranchAmount), 0) -
																	Number(selectedCredit.creditAmount)
																} />
															</li>
															<li className='border-start border-dark border-opacity-50 ps-2'>
																<b>Amount to pay</b>: <CurrencyText amount={
																	JSON.parse(selectedCredit.creditPayment).reduce((sum, tr) => sum + Number(tr.tranchAmount), 0)
																} />
															</li>
														</ul>

														{/* The plan */}
														<div className='overflow-auto'>
															<table className="table table-hover h-100">
																<thead className='table-primary position-sticky top-0 inx-1 text-uppercase small'>
																	<tr>
																		<th className='ps-sm-3 py-3 text-nowrap text-gray-700 fw-normal'>Tranche</th>
																		<th className='py-3 text-nowrap text-gray-700 fw-normal fw-normal'>Backfill amount</th>
																		<th className='py-3 text-nowrap text-gray-700 fw-normal fw-normal'>Backfill date</th>
																	</tr>
																</thead>
																<tbody>
																	{JSON.parse(selectedCredit.creditPayment)
																		.sort((a, b) => a.tranchNumber - b.tranchNumber) // Sort tranches
																		.map((item, index) => (
																			<tr key={index} className="small expense-row">
																				<td className="ps-sm-3 border-bottom-3 border-end">
																					{item.tranchNumber}
																				</td>
																				<td>
																					<CurrencyText amount={Number(item.tranchAmount)} />
																				</td>
																				<td>
																					<FormatedDate date={item.tranchDueDate} />
																				</td>
																			</tr>
																		))
																	}
																</tbody>
															</table>
														</div>
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

				{showRequestCreditForm && (
					<div className="position-fixed fixed-top inset-0 bg-black3 py-3 inx-high add-credit-form">
						<div className="container col-md-9 col-lg-8 col-xl-6 overflow-auto" style={{ animation: "zoomInBack .2s 1", maxHeight: '100%' }}>
							<div className="px-3 bg-light text-gray-700">
								{/* Header */}
								<h6 className="sticky-top flex-align-center justify-content-between mb-2 pt-3 pb-2 bg-light text-gray-600 border-bottom text-uppercase">
									<div className="flex-align-center">
										<span style={{ lineHeight: 1 }}>Request a New Credit</span>
									</div>
									<div title="Cancel" onClick={() => setShowRequestCreditForm(false)}>
										<X size={25} className="ptr" />
									</div>
								</h6>

								{/* Info Message */}
								<NextStepInformer type='info' content='Fill in the details to request a new credit. Ensure all information is accurate.' />

								{/* Form */}
								<form onSubmit={handleRequestCredit} className="px-sm-2 pb-5">
									{/* Credit Amount */}
									<div className="mb-3">
										<label className="form-label fw-semibold">
											Credit Amount {!['', 0].includes(creditAmount) && (
												<><span>( <CurrencyText amount={Number(creditAmount)} className="ms-1" /> )</span></>
											)}
										</label>
										<input
											type="number"
											className="form-control border border-2 border-info border-opacity-50 rounded-0 h-3rem"
											value={creditAmount}
											onChange={(e) => setCreditAmount(e.target.value)}
											min={1}
											placeholder="Enter credit amount"
											required
										/>
										{!['', 0].includes(creditAmount) && (
											<div className="form-text px-2 py-1 bg-info-subtle rounded-bottom-3 smaller fst-italic">
												With {creditPrimaryInterest}% Interest = <CurrencyText amount={creditAmount * creditPrimaryInterestPercentage} />
											</div>
										)}
									</div>

									<div className="d-md-flex gap-3 align-items-center">
										{/* Request Date */}
										<div className="mb-3 col">
											<label className="form-label fw-semibold">
												Request Date {!['', 0].includes(requestDate) && (<FormatedDate date={requestDate} className="ms-1 fw-normal fst-italic" />)}
											</label>
											<input
												type="date"
												className="form-control border border-2 border-secondary border-opacity-25 rounded-0"
												value={requestDate}
												onChange={(e) => setRequestDate(e.target.value)}
												required
											/>
										</div>

										<ArrowsVertical className='d-block d-md-none mx-auto' />
										<ArrowsHorizontal className='d-none d-md-block mt-3' />

										{/* Due Date */}
										<div className="mb-3 col">
											<label className="form-label fw-semibold">
												Due Date {!['', 0].includes(dueDate) && (<FormatedDate date={dueDate} className="ms-1 fw-normal fst-italic" />)}
											</label>
											<input
												type="date"
												className="form-control border border-2 border-secondary border-opacity-25 rounded-0"
												value={dueDate}
												onChange={(e) => setDueDate(e.target.value)}
												required
											/>
										</div>
									</div>

									{/* Number of Tranches */}
									<div className="mb-3 p-2 bg-info-subtle">
										<div className="mb-3">
											<label className="form-label fw-semibold">Number of Tranches (Max: 12)</label>
											<input
												type="number"
												className="form-control"
												value={tranches}
												onChange={(e) => {
													setTranches(maxInputNumber(e, 12));
												}}
												min={1}
												max={12}
												placeholder="Enter number of tranches"
												required
											/>
										</div>
										<hr />
										{renderTrancheInputs()}
									</div>

									{/* Comment */}
									<div className="mb-3">
										<label className="form-label fw-semibold">Comment</label>
										<textarea
											className="form-control border border-2 border-secondary border-opacity-25 rounded-0"
											value={comment}
											onChange={(e) => setComment(e.target.value)}
											placeholder="Comment about this request"
											rows={4}
											required
										></textarea>
									</div>

									{/* Submit Button */}
									<div className="mb-3 p-2 form-text bg-dark-subtle rounded">
										<p className='mb-2 text-dark-emphasis'>
											Please verify the details before submiting.
										</p>
										<div className="px-3">
											<div className='d-flex cols-2'>
												<div className="col fw-semibold">Credit:</div>
												<div className="col"><CurrencyText amount={Number(creditAmount)} smallCurrency /></div>
											</div>
											<div className='d-flex cols-2'>
												<div className="col fw-semibold">Interest ({creditPrimaryInterest}%):</div>
												<div className="col"><CurrencyText amount={Number(creditAmount) * creditPrimaryInterestPercentage} smallCurrency /></div>
											</div>
											<div className='d-flex cols-2'>
												<div className="col fw-semibold">Due date:</div>
												<div className="col"><FormatedDate date={dueDate} /></div>
											</div>
											{trancheDates.length > 0 && // Ensure trancheDates is not empty
												new Date(trancheDates[trancheDates.length - 1]) > new Date(dueDate) && (
													<div className="form-text px-2 py-1 bg-danger-subtle rounded-bottom-3 smaller">
														<WarningCircle size={22} weight='fill' className='me-1 opacity-50' />
														Last tranche due date can not be after the credit's due date
													</div>
												)
											}
											{totaltrancheAmounts !== totalPaymentAmount && (
												<div className="form-text px-2 py-1 bg-danger-subtle rounded-bottom-3 smaller">
													<WarningCircle size={22} weight='fill' className='me-1 opacity-50' />
													{totaltrancheAmounts > totalPaymentAmount ? (
														<>
															<p>
																Total tranche payment amount <CurrencyText amount={totaltrancheAmounts} boldAmount={true} /> can not be greater than total payment amount <CurrencyText amount={totalPaymentAmount} boldAmount={true} />. Please adjust tranche payment values to match the total payment.
															</p>
															<p>
																Difference: <CurrencyText amount={totaltrancheAmounts - totalPaymentAmount} boldAmount={true} />
															</p>
														</>
													) : (
														<>
															<p>
																Total tranche payment amount <CurrencyText amount={totaltrancheAmounts} boldAmount={true} /> can not be less than total payment amount <CurrencyText amount={totalPaymentAmount} boldAmount={true} />. Please adjust tranche payment values to match the total payment.
															</p>
															<p>
																Difference: <CurrencyText amount={totalPaymentAmount - totaltrancheAmounts} boldAmount={true} />
															</p>
														</>
													)}
												</div>
											)}
										</div>

										<button type="submit" className="btn btn-sm btn-dark flex-center w-100 mt-5 py-2 px-4 rounded-pill clickDown" id="addSavingBtn" disabled={(new Date(trancheDates[trancheDates.length - 1]) > new Date(dueDate)) || tranches === 0 || (totaltrancheAmounts !== (creditAmount * (1 + creditPrimaryInterestPercentage)))}
										>
											{!isWaitingFetchAction ?
												<>Submit Request <FloppyDisk size={18} className='ms-2' /></>
												: <>Submitting... <SmallLoader color='light' /></>
											}
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				)}
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
				return toast({
					message: <><WarningCircle size={22} weight='fill' className='me-1 opacity-50' /> Enter valid expense amount to continue</>,
					type: 'gray-700'
				});
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
				setErrorWithFetchAction(error.message);
				cError("Error adding savings:", error);
				warningToast({ message: error.message || "An unknown error occurred" });
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
						<h2 className='text-appColor'><CashRegister weight='fill' className="me-1 opacity-50" /> Expenses panel</h2>
					</div>
					<div className="d-lg-flex align-items-center">
						<img src="/images/transactions_visual.png" alt="" className='d-none d-lg-block col-md-5' />
						<div className='alert mb-4 rounded-0 smaller fw-light'>
							The Expenses panel provides a detailed record of all expenses, ensuring complete transparency and accountability. Here, you can review logs of withdrawals and other expenditures, offering a comprehensive view of each group's spending activities for easy comprehension.
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
					{!loadingMembers && !errorLoadingMembers && !membersToShow.length && (
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
										<table className="table table-striped table-hover h-100">
											<thead className='table-warning position-sticky top-0 inx-1 text-uppercase small'>
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
																	<Popover content={<><Watch size={15} /> {getDateHoursMinutes(record.createdAt)}</>} trigger='hover' placement='top' className='flex-center py-1 px-2 bg-gray-400 text-dark border border-secondary border-opacity-25 text-tuncate smaller shadow-none' arrowColor='var(--bs-gray-400)' height='1.9rem' width='fit-content'>
																		<FormatedDate date={record.createdAt} />
																	</Popover>
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
											<div className='position-fixed fixed-top inset-0 bg-white3 py-3 py-md-5 inx-high'>
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
																	: <>Working <SmallLoader color='light' /></>
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
					)}
				</div>
			</div>
		)
	}

	// Reports
	const Reports = () => {

		const [activeReportSection, setActiveReportSection] = useState('incomeExpenses');

		// Count report values
		let totalCotisationsAndShares = 0;
		let generalTotal = Number(allFigures?.balance);

		// Handle exports
		const reportViewRef = useRef();

		// Create income and expenses report

		const expenses = allRecords.filter(r => r.recordType === 'expense');
		const expenseTypes = [];
		const expenseData = [];

		// __Extract different types of expenses
		expenses.forEach(item => {
			const subtype = item.recordSecondaryType;
			if (!expenseTypes.includes(subtype)) {
				expenseTypes.push(subtype);
			}
		});

		// ___Construct { expense : value } array
		expenseTypes.forEach(item => {
			const value = expenses
				.filter(rc => rc.recordSecondaryType === item)
				.reduce((sum, rc) => (sum + Number(rc.recordAmount)), 0);
			expenseData.push({ type: 'expense', label: item, amount: value });
		});

		// __Construct incomes
		const incomesData = [];
		const incomes = [
			{ penalties: Number(allFigures?.penalties) }
		];

		incomes.forEach(item => {
			const [label, value] = Object.entries(item)[0]; // Extract key and value
			incomesData.push({ type: 'income', label, amount: value });
		});

		// __Combine income and expenses
		const incomeExpenses = [...expenseData, ...incomesData];

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
				</div>
				<hr className='mb-4 d-lg-none' />

				<div ref={reportViewRef} className='mb-3 bg-bodi'>
					<div className="alert alert-success smaller">
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
															<td className={`${item.type === 'income' ? 'text-success' : 'text-warning-emphasis'} text-capitalize`}>
																{item.label} {item.label.toLowerCase() === 'social' ? ' expenses' : ''}
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
														<CurrencyText amount={Number(allFigures?.balance)} />
													</td>
													<td></td>
													<td></td>
												</tr>
												{activeMembers
													.sort((a, b) => a.husbandFirstName.localeCompare(b.husbandFirstName))
													.map((item, index) => {
														const memberNames = `${item.husbandFirstName} ${item.husbandLastName}`;
														const memberCostisation = item.cotisation;
														const memberSocial = Number(item.social);
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
												<tr className="small cursor-default clickDown general-report-row text-info-enphasis">
													<td></td>
													<td></td>
													<td>
														Verify
													</td>
													<td className={`text-nowrap ${generalTotal - totalCotisationsAndShares < 0 ? 'text-danger' : ''}`}>
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
			</div>
		)
	}

	// Settings
	const Settings = () => {
		return (
			<SystemSettings data={allSettings} userType={signedUserType} />
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

	// Set notifications
	const [adminHasNewNotifications, setAdminHasNewNotifications] = useState(true);

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
			case "settings":
				return <Settings />;
			case "auditLogs":
				return <AuditLogs />;
			default:
				return <Dashboard />;
		}
	};

	// User restriction
	const restrictedStatus = ['inactive', 'removed'];
	if (!signedUser || !userId) {
		return (
			<Container className="d-flex justify-content-center align-items-center vh-100">
				<Card className="text-center p-4 shadow-lg" style={{ maxWidth: "400px" }}>
					<Card.Body>
						<Card.Title className="text-danger">Unknown user account</Card.Title>
						<Card.Text>If you believe this is an error, please reach out for support.</Card.Text>
						<Button variant="primary" href="/login"><CaretRight /> Sign in</Button>
					</Card.Body>
				</Card>
			</Container>
		);
	} else if (signedUser?.id) {
		if (restrictedStatus.includes(signedUser?.status)) {
			return (
				<Container className="d-flex justify-content-center align-items-center vh-100">
					<Card className="text-center p-4 shadow-lg" style={{ maxWidth: "400px" }}>
						<Card.Body>
							<Card.Title className="text-danger">Account Restricted</Card.Title>
							{signedUser?.status === "inactive" && (
								<Card.Text>Your account is inactive. If you believe this is an error, please reach out for support.</Card.Text>
							)}
							{signedUser?.status === "removed" && (
								<Card.Text>Your account has been removed. If you believe this is an error, please reach out for support.</Card.Text>
							)}
							<Button variant="primary" href="/login"><CaretRight /> Sign in</Button>
						</Card.Body>
					</Card>
				</Container>
			);
		}
	}

	return (
		<>
			{/* Toast message */}
			<MyToast show={showToast} message={toastMessage} type={toastType} selfClose={toastSelfClose} selfCloseTimeout={toastSelfCloseTimeout} onClose={() => resetToast()} />

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
				<div className='nav-item navbar-brand position-relative col-12 col-md-3 col-xl-2 d-flex align-items-center me-0 px-2'>
					<div className="me-2 logo">
						<img src='/logo.jpeg' alt="" className="rounded-circle logo p-2"></img>
					</div>
					<small className='fs-70 text-gray-200'>
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
					<Popover content="Balance" trigger='hover' placement='bottom' className='py-1 px-2 smaller shadow-none bg-appColor text-gray-200 border border-secondary border-opacity-25' arrowColor='var(--appColor)' height='1.9rem'>
						<div className="position-absolute start-50 top-100 translate-middle flex-align-center gap-1  px-3 py-1 border border-secondary border-opacity-50 rounded-pill fs-50 shadow-sm ptr clickDown balance-indicator"
							onClick={() => { setActiveSection("dashboard"); }}
						>
							<Wallet size={14} weight='fill' /><CurrencyText amount={Number(allFigures?.balance)} />
						</div>
					</Popover>
				</div>
				<div className='d-none d-md-flex flex-grow-1 border-bottom py-1'>
					<div className="me-3 ms-auto navbar-nav">
						<div className="nav-item d-flex gap-2 text-nowrap small" style={{ '--_activeColor': 'var(--primaryColor)' }}>
							<Popover content="Refresh data" trigger='hover' placement='bottom' className='py-1 px-2 smaller shadow-none border border-secondary border-opacity-25' arrowColor='var(--bs-gray-400)' height='1.9rem'>
								<button className={`nav-link px-2 text-gray-600 rounded-pill clickDown`} title='Refresh data'
									onClick={refreshAllData}
								>
									<ArrowsClockwise size={20} />
								</button>
							</Popover>
							<Popover content="Notifications" trigger='hover' placement='bottom' className='py-1 px-2 smaller shadow-none border border-secondary border-opacity-25' arrowColor='var(--bs-gray-400)' height='1.9rem'>
								<button className={`nav-link px-2 ${adminHasNewNotifications ? 'bg-gray-300 text-primaryColor active-with-dot' : 'text-gray-600'} rounded-pill clickDown`} title='Notifications'>
									<BellSimple weight={adminHasNewNotifications ? 'fill' : undefined} size={20}
										style={{ animation: adminHasNewNotifications ? 'shakeX 10s infinite' : 'unset' }}
									/>
								</button>
							</Popover>
						</div>
					</div>
					<div className="d-flex align-items-center me-3 border-light border-opacity-25">
						<div className='ms-auto d-grid pb-1'>
							<span className='ms-auto smaller'>{signedUser?.husbandFirstName}</span>
							<span className='ms-auto fs-70 opacity-75 text-capitalize' style={{ lineHeight: 1 }}>{signedUser?.role}</span>
						</div>
						<Menu menuButton={
							<MenuButton className="border-0 p-0">
								<img src={signedUser?.husbandAvatar} alt="" className='w-2_5rem ratio-1-1 object-fit-cover ms-2 d-none d-md-block border border-3 border-light bg-light rounded-circle ptr' />
							</MenuButton>
						} transition>
							<MenuItem onClick={() => { setActiveSection('settings') }}>
								<Gear weight='fill' className="me-2 opacity-50" /> Settings
							</MenuItem>
							<MenuDivider />
							<MenuItem onClick={() => { logout() }}>
								<SignOut weight='fill' className="me-2 opacity-50" /> Sign out
							</MenuItem>
						</Menu>
					</div>
				</div>
			</header>
			<main className="container-fluid">
				<div className="row">
					{/* Sidebar Navigation */}
					<nav className={`col-12 col-md-3 col-xl-2 px-3 px-sm-5 px-md-0 d-md-block border-end overflow-y-auto sidebar ${sideNavbarIsFloated ? 'floated' : ''}`} id="sidebarMenu">
						<div ref={sideNavbarRef} className={`position-sticky top-0 h-fit my-3 my-md-0 py-3 pt-md-4 col-8 col-sm-5 col-md-12 ${sideNavbarIsFloated ? 'rounded' : ''}`}>
							<div className="d-flex align-items-center d-md-none mb-3 px-3 pb-2 border-light border-opacity-25">
								<div className='ms-auto d-grid pb-1'>
									<span className='ms-auto smaller'>{`${signedUser?.husbandFirstName} ${signedUser?.husbandLastName}`}</span>
									<span className='ms-auto fs-70 opacity-75' style={{ lineHeight: 1 }}>{signedUser?.role}</span>
								</div>
								<img src={signedUser?.husbandAvatar} alt="User" className='w-2_5rem ratio-1-1 object-fit-cover ms-2 border border-3 border-secondary bg-gray-600 rounded-circle' />
							</div>

							<ul className="nav flex-column">
								<li className={`nav-item mx-4 mx-sm-5 mx-md-2 mb-2 ${activeSection === 'dashboard' ? 'active blur-bg-2px' : ''}`}
									onClick={() => { setActiveSection("dashboard"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<ChartPieSlice size={20} weight='fill' className="me-2" /> Dashboard
									</button>
								</li>
								<li className={`nav-item mx-4 mx-sm-5 mx-md-2 mb-2 ${activeSection === 'members' ? 'active blur-bg-2px' : ''}`}
									onClick={() => { setActiveSection("members"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<Users size={20} weight='fill' className="me-2" /> Members
									</button>
								</li>
								<li className={`nav-item mx-4 mx-sm-5 mx-md-2 mb-2 ${activeSection === 'savings' ? 'active blur-bg-2px' : ''}`}
									onClick={() => { setActiveSection("savings"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<Coin size={20} weight='fill' className="me-2" /> Savings
									</button>
								</li>
								<li className={`nav-item mx-4 mx-sm-5 mx-md-2 mb-2 ${activeSection === 'interest' ? 'active blur-bg-2px' : ''}`}
									onClick={() => { setActiveSection("interest"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<Coins size={20} weight='fill' className="me-2" /> Interest
									</button>
								</li>
								<li className={`nav-item mx-4 mx-sm-5 mx-md-2 mb-2 ${activeSection === 'credits' ? 'active blur-bg-2px' : ''}`}
									onClick={() => { setActiveSection("credits"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<Blueprint size={20} weight='fill' className="me-2" /> Credits
									</button>
								</li>
								<li className={`nav-item mx-4 mx-sm-5 mx-md-2 mb-2 ${activeSection === 'transactions' ? 'active blur-bg-2px' : ''}`}
									onClick={() => { setActiveSection("transactions"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<CashRegister size={20} weight='fill' className="me-2" /> Expenses
									</button>
								</li>
								<li className={`nav-item mx-4 mx-sm-5 mx-md-2 ${activeSection === 'reports' ? 'active' : ''}`}
									onClick={() => { setActiveSection("reports"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<Files size={20} weight='fill' className="me-2" /> Reports
									</button>
								</li>
								{/* <li className={`nav-item mx-4 mx-sm-5 mx-md-2 mb-2 ${activeSection === 'messages' ? 'active blur-bg-2px' : ''}`}
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

								{/* <li className={`nav-item mx-4 mx-sm-5 mx-md-2 mb-2 ${activeSection === 'auditLogs' ? 'active blur-bg-2px' : ''}`}
									onClick={() => { setActiveSection("auditLogs"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<Notebook size={20} weight='fill' className="me-2" /> Audit Logs
									</button>
								</li> */}

								<li className={`nav-item mx-4 mx-sm-5 mx-md-2 mb-2 ${activeSection === 'settings' ? 'active blur-bg-2px' : ''}`}
									onClick={() => { setActiveSection("settings"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<Gear size={20} weight='fill' className="me-2" /> Settings
									</button>
								</li>

								<li className={`nav-item mx-4 mx-sm-5 mx-md-2 mb-3 d-md-none clickDown`} onClick={() => { logout() }}>
									<button className="nav-link w-100">
										<SignOut size={20} weight='fill' className="me-2" /> Sign out
									</button>
								</li>
							</ul>
						</div>
					</nav>

					{/* Content Area */}
					<div className="col-md-9 col-xl-10 ms-sm-auto px-md-4 pt-4 pt-md-2 pb-2">
						{renderContent()}
					</div>
				</div>

				{/* Fixed components */}
			</main>
		</>
	)
}

export default UserUI;