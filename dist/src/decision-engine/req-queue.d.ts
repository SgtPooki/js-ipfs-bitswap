import type { PeerId } from '@libp2p/interface-peer-id';
import { SortedMap } from '../utils/sorted-map.js';
import type { Task, TaskMerger } from './index.js';
export interface PopTaskResult {
    peerId?: PeerId;
    tasks: Task[];
    pendingSize: number;
}
export interface PendingTask {
    created: number;
    task: Task;
}
/**
 * Queue of requests to be processed by the engine.
 * The requests from each peer are added to the peer's queue, sorted by
 * priority.
 * Tasks are popped in priority order from the best peer - see popTasks()
 * for more details.
 */
export declare class RequestQueue {
    private readonly _taskMerger;
    _byPeer: SortedMap<string, PeerTasks>;
    constructor(taskMerger?: TaskMerger);
    /**
     * Push tasks onto the queue for the given peer
     */
    pushTasks(peerId: PeerId, tasks: Task[]): void;
    /**
     * Choose the peer with the least active work (or if all have the same active
     * work, the most pending tasks) and pop off the highest priority tasks until
     * the total size is at least targetMinBytes.
     * This puts the popped tasks into the "active" state, meaning they are
     * actively being processed (and cannot be modified).
     */
    popTasks(targetMinBytes: number): PopTaskResult;
    _head(): PeerTasks | undefined;
    /**
     * Remove the task with the given topic for the given peer.
     */
    remove(topic: string, peerId: PeerId): void;
    /**
     * Called when the tasks for the given peer complete.
     */
    tasksDone(peerId: PeerId, tasks: Task[]): void;
}
/**
 * Queue of tasks for a particular peer, sorted by priority.
 */
declare class PeerTasks {
    peerId: PeerId;
    private readonly _taskMerger;
    private _activeTotalSize;
    private readonly _pending;
    private readonly _active;
    constructor(peerId: PeerId, taskMerger: TaskMerger);
    /**
     * Push tasks onto the queue
     */
    pushTasks(tasks: Task[]): void;
    _pushTask(task: Task): void;
    /**
     * Indicates whether the new task adds any more information over tasks that are
     * already in the active task queue
     */
    _taskHasMoreInfoThanActiveTasks(task: Task): boolean;
    /**
     * Pop tasks off the queue such that the total size is at least targetMinBytes
     */
    popTasks(targetMinBytes: number): PopTaskResult;
    /**
     * Called when a task completes.
     * Note: must be the same reference as returned from popTasks.
     */
    taskDone(task: Task): void;
    /**
     * Remove pending tasks with the given topic
     */
    remove(topic: string): void;
    /**
     * No work to be done, this PeerTasks object can be freed.
     */
    isIdle(): boolean;
    /**
     * Compare PeerTasks
     */
    static compare<Key>(a: [Key, PeerTasks], b: [Key, PeerTasks]): number;
}
export {};
//# sourceMappingURL=req-queue.d.ts.map