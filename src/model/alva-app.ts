import * as Mobx from 'mobx';
import * as Types from '../types';
import * as uuid from 'uuid';

export interface AlvaAppInit {
	id?: string;
	activeView: Types.AlvaView;
	hasFocusedInput: boolean;
	panes: Set<Types.AppPane>;
	paneSizes: Types.PaneSize[];
	rightSidebarTab: Types.RightSidebarTab;
	searchTerm: string;
	state: Types.AppState;
}

export class AlvaApp {
	public readonly model = Types.ModelName.AlvaApp;
	private id: string = uuid.v4();

	@Mobx.observable private activeView: Types.AlvaView = Types.AlvaView.SplashScreen;
	@Mobx.observable private hoverArea: Types.HoverArea = Types.HoverArea.Chrome;
	@Mobx.observable private paneSelectOpen: boolean = false;

	@Mobx.observable
	private rightSidebarTab: Types.RightSidebarTab = Types.RightSidebarTab.Properties;

	@Mobx.observable private searchTerm: string = '';
	@Mobx.observable private state: Types.AppState = Types.AppState.Starting;

	@Mobx.observable
	private panes: Set<Types.AppPane> = new Set([
		Types.AppPane.PagesPane,
		Types.AppPane.ElementsPane,
		Types.AppPane.PropertiesPane
	]);

	@Mobx.observable private paneSizes: Map<Types.AppPane, Types.PaneSize> = new Map();

	@Mobx.observable private hasFocusedInput: boolean = false;

	public constructor(init?: AlvaAppInit) {
		if (init) {
			this.id = init.id || uuid.v4();
			this.activeView = init.activeView;
			this.panes = init.panes;
			this.searchTerm = init.searchTerm;
			this.state = init.state;
			this.hasFocusedInput = init.hasFocusedInput;
			init.paneSizes.forEach(paneSize => this.setPaneSize(paneSize));
		}
	}

	public static from(serialized: Types.SerializedAlvaApp): AlvaApp {
		return new AlvaApp({
			activeView: deserializeView(serialized.activeView),
			hasFocusedInput: serialized.hasFocusedInput,
			panes: new Set(serialized.panes.map(deserializePane)),
			paneSizes: serialized.paneSizes.map(p => ({
				width: p.width,
				height: p.height,
				pane: deserializePane(p.pane)
			})),
			rightSidebarTab: deserializeRightSidebarTab(serialized.rightSidebarTab),
			searchTerm: serialized.searchTerm,
			state: deserializeState(serialized.state)
		});
	}

	public getActiveView(): Types.AlvaView {
		return this.activeView;
	}

	public getHasFocusedInput(): boolean {
		return this.hasFocusedInput;
	}

	public getHoverArea(): Types.HoverArea {
		return this.hoverArea;
	}

	public getId(): string {
		return this.id;
	}

	public getPanes(): Set<Types.AppPane> {
		return this.panes;
	}

	public getPaneSelectOpen(): boolean {
		return this.paneSelectOpen;
	}

	public getPaneSize(pane: Types.AppPane): Types.PaneSize | undefined {
		return this.paneSizes.get(pane);
	}

	public getRightSidebarTab(): Types.RightSidebarTab {
		return this.rightSidebarTab;
	}

	public getSearchTerm(): string {
		return this.searchTerm;
	}

	public getState(): Types.AppState {
		return this.state;
	}

	public isVisible(pane: Types.AppPane): boolean {
		return this.panes.has(pane);
	}

	@Mobx.action
	public setActiveView(view: Types.AlvaView): void {
		this.activeView = view;
	}

	@Mobx.action
	public setHasFocusedInput(hasFocusedInput: boolean): void {
		this.hasFocusedInput = hasFocusedInput;
	}

	@Mobx.action
	public setPaneSelectOpen(paneSelectOpen: boolean): void {
		this.paneSelectOpen = paneSelectOpen;
	}

	@Mobx.action
	public setPaneSize(size: Types.PaneSize): void {
		this.paneSizes.set(size.pane, size);
	}

	@Mobx.action
	public setHoverArea(hoverArea: Types.HoverArea): void {
		this.hoverArea = hoverArea;
	}

	@Mobx.action
	public setPane(pane: Types.AppPane, visible: boolean): void {
		if (visible) {
			this.panes.add(pane);
		} else {
			this.panes.delete(pane.toString() as Types.AppPane);
		}

		// TODO: Find out why MobX does not react to Set.prototype.add/delete
		this.panes = new Set(this.panes.values());
	}

	@Mobx.action
	public setPanes(panes: Types.AppPane[]): void {
		this.panes = new Set(panes);
	}

	@Mobx.action
	public setRightSidebarTab(rightSidebarTab: Types.RightSidebarTab): void {
		this.rightSidebarTab = rightSidebarTab;
	}

	@Mobx.action
	public setSearchTerm(term: string): void {
		this.searchTerm = term;
	}

	@Mobx.action
	public setState(state: Types.AppState): void {
		this.state = state;
	}

	public toJSON(): Types.SerializedAlvaApp {
		return {
			model: this.model,
			activeView: serializeView(this.activeView),
			hasFocusedInput: this.hasFocusedInput,
			panes: [...this.panes.values()].map(serializePane),
			paneSizes: [...this.paneSizes.values()].map(paneSize => ({
				width: paneSize.width,
				height: paneSize.height,
				pane: serializePane(paneSize.pane)
			})),
			rightSidebarTab: serializeRightSidebarTab(this.rightSidebarTab),
			searchTerm: this.searchTerm,
			state: serializeState(this.state)
		};
	}

	@Mobx.action
	public update(b: AlvaApp): void {
		this.activeView = b.activeView;
		this.panes = b.panes;
		this.paneSizes = b.paneSizes;
		this.rightSidebarTab = b.rightSidebarTab;
		this.searchTerm = b.searchTerm;
		this.state = b.state;
	}
}

function deserializePane(state: Types.SerializedAppPane): Types.AppPane {
	switch (state) {
		case 'pages-pane':
			return Types.AppPane.PagesPane;
		case 'patterns-pane':
			return Types.AppPane.PatternsPane;
		case 'elements-pane':
			return Types.AppPane.ElementsPane;
		case 'properties-pane':
			return Types.AppPane.PropertiesPane;
		case 'development-pane':
			return Types.AppPane.DevelopmentPane;
	}
	throw new Error(`Unknown app pane: ${state}`);
}

function deserializeRightSidebarTab(tab: Types.SerializedRightSidebarTab): Types.RightSidebarTab {
	switch (tab) {
		case 'properties':
			return Types.RightSidebarTab.Properties;
		case 'project-settings':
			return Types.RightSidebarTab.ProjectSettings;
	}
	throw new Error(`Unknown tab: ${tab}`);
}

function deserializeState(state: Types.SerializedAppState): Types.AppState {
	switch (state) {
		case 'starting':
			return Types.AppState.Starting;
		case 'started':
			return Types.AppState.Started;
	}
	throw new Error(`Unknown app state: ${state}`);
}

function deserializeView(state: Types.SerializedAlvaView): Types.AlvaView {
	switch (state) {
		case 'SplashScreen':
			return Types.AlvaView.SplashScreen;
		case 'PageDetail':
			return Types.AlvaView.PageDetail;
	}
	throw new Error(`Unknown app state: ${state}`);
}

function serializePane(pane: Types.AppPane): Types.SerializedAppPane {
	switch (pane) {
		case Types.AppPane.PagesPane:
			return 'pages-pane';
		case Types.AppPane.PatternsPane:
			return 'patterns-pane';
		case Types.AppPane.ElementsPane:
			return 'elements-pane';
		case Types.AppPane.PropertiesPane:
			return 'properties-pane';
		case Types.AppPane.DevelopmentPane:
			return 'development-pane';
	}
	throw new Error(`Unknown app pane: ${pane}`);
}

function serializeRightSidebarTab(tab: Types.RightSidebarTab): Types.SerializedRightSidebarTab {
	switch (tab) {
		case Types.RightSidebarTab.Properties:
			return 'properties';
		case Types.RightSidebarTab.ProjectSettings:
			return 'project-settings';
	}
	throw new Error(`Unknown tab: ${tab}`);
}

function serializeState(state: Types.AppState): Types.SerializedAppState {
	switch (state) {
		case Types.AppState.Starting:
			return 'starting';
		case Types.AppState.Started:
			return 'started';
	}
	throw new Error(`Unknown app state: ${state}`);
}

function serializeView(view: Types.AlvaView): Types.SerializedAlvaView {
	switch (view) {
		case Types.AlvaView.SplashScreen:
			return 'SplashScreen';
		case Types.AlvaView.PageDetail:
			return 'PageDetail';
	}
	throw new Error(`Unknown app state: ${view}`);
}
